import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useForm, FormProvider } from 'react-hook-form';
import { getDefaultCenterFromTimezone } from './timezoneDefault';
import './LocationMapModal.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_ZOOM = 12;
const SEARCH_DEBOUNCE_MS = 400;
const NOMINATIM_HEADERS = { Accept: 'application/json', 'User-Agent': 'RESUL-App/1.0' };

const TILE_LAYER_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
const TILE_LAYER_OPTIONS = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    maxNativeZoom: 19,
    minZoom: 1,
};

/** Nominatim search – free place autocomplete (OpenStreetMap). */
async function searchPlaces(query) {
    if (!query || query.trim().length < 2) return [];
    try {
        const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
            q: query.trim(),
            format: 'json',
            addressdetails: 1,
            limit: 8,
        })}`;
        const res = await fetch(url, { headers: NOMINATIM_HEADERS });
        const data = await res.json();
        if (!Array.isArray(data)) return [];
        return map((item) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            displayName: item.display_name || '',
            name: item.name || item.address?.name || item.address?.neighbourhood || item.address?.suburb || (item.display_name || '').split(',')[0]?.trim() || '',
        }));
    } catch {
        return [];
    }
}

/** Nominatim reverse geocode – free (OpenStreetMap). */
async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: NOMINATIM_HEADERS }
        );
        const data = await res.json();
        if (!data) return { placeName: '', address: '' };
        const displayName = data.display_name || '';
        const name = data.name || data.address?.name || data.address?.neighbourhood || data.address?.suburb || (displayName.split(',')[0] || '').trim();
        return { placeName: name || (displayName.split(',')[0] || '').trim(), address: displayName };
    } catch {
        return { placeName: '', address: '' };
    }
}

const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({ click(e) { onLocationSelect(e.latlng); } });
    return null;
};

const MapCenterController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.length === 2) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const MapInvalidateSize = ({ isVisible }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || !isVisible) return;
        map.invalidateSize();
        const t1 = setTimeout(() => map.invalidateSize(), 100);
        const t2 = setTimeout(() => map.invalidateSize(), 350);
        const t3 = setTimeout(() => map.invalidateSize(), 700);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [map, isVisible]);
    return null;
};

const MAP_MOUNT_DELAY_MS = 300;

const LeafletMapModal = ({ show, handleClose, initialValues = {}, onSave }) => {
    const [mapReady, setMapReady] = useState(false);
    useEffect(() => {
        if (!show) {
            setMapReady(false);
            return;
        }
        const t = setTimeout(() => setMapReady(true), MAP_MOUNT_DELAY_MS);
        return () => clearTimeout(t);
    }, [show]);

    const defaultCenter = useMemo(() => getDefaultCenterFromTimezone(), []);
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

    const methods = useForm({ defaultValues, mode: 'onChange' });
    const { control, watch, setValue, getValues, reset } = methods;
    const latitude = watch('latitude');
    const longitude = watch('longitude');
    const regionName = watch('regionName');

    const lastGeocodedRef = useRef({ lat: null, lng: null });
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (show) {
            reset(defaultValues);
            lastGeocodedRef.current = { lat: null, lng: null };
            setSuggestions([]);
            setSuggestionsOpen(false);
        }
    }, [show, reset, defaultValues]);

    const center = useMemo(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
        return defaultCenter;
    }, [latitude, longitude, defaultCenter]);

    const markerPosition = useMemo(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (latitude !== '' && longitude !== '' && !Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
        return null;
    }, [latitude, longitude]);

    useEffect(() => {
        if (!show) return;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (latitude === '' || longitude === '' || Number.isNaN(lat) || Number.isNaN(lng)) return;
        if (lastGeocodedRef.current.lat === lat && lastGeocodedRef.current.lng === lng) return;
        lastGeocodedRef.current = { lat, lng };
        let cancelled = false;
        reverseGeocode(lat, lng).then(({ placeName, address }) => {
            if (cancelled) return;
            setValue('regionName', placeName ?? '', { shouldValidate: false });
            setValue('address', address ?? '', { shouldValidate: false });
        });
        return () => { cancelled = true; };
    }, [show, latitude, longitude, setValue]);

    const handleMapClick = useCallback(
        async (latlng) => {
            const lat = latlng.lat;
            const lng = latlng.lng;
            lastGeocodedRef.current = { lat, lng };
            setValue('latitude', lat, { shouldValidate: true });
            setValue('longitude', lng, { shouldValidate: true });
            const { placeName, address } = await reverseGeocode(lat, lng);
            setValue('regionName', placeName ?? '', { shouldValidate: false });
            setValue('address', address ?? '', { shouldValidate: false });
        },
        [setValue],
    );

    const onPlaceInputChange = useCallback(
        (e) => {
            const value = e.target.value;
            setValue('regionName', value, { shouldValidate: true });
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (!value.trim()) {
                setSuggestions([]);
                setSuggestionsOpen(false);
                return;
            }
            debounceRef.current = setTimeout(() => {
                searchPlaces(value).then((list) => {
                    setSuggestions(list);
                    setSuggestionsOpen(list.length > 0);
                });
            }, SEARCH_DEBOUNCE_MS);
        },
        [setValue],
    );

    const onSuggestionSelect = useCallback(
        (item) => {
            setSuggestions([]);
            setSuggestionsOpen(false);
            lastGeocodedRef.current = { lat: item.lat, lng: item.lon };
            setValue('latitude', item.lat, { shouldValidate: true });
            setValue('longitude', item.lon, { shouldValidate: true });
            setValue('regionName', item.name || item.displayName.split(',')[0]?.trim() || '', { shouldValidate: false });
            setValue('address', item.displayName, { shouldValidate: false });
        },
        [setValue],
    );

    const handleSave = () => {
        const values = getValues();
        const lat = values.latitude;
        const lng = values.longitude;
        if (lat != null && lat !== '' && lng != null && lng !== '') {
            onSave?.({ latitude: lat, longitude: lng, regionName: values.regionName ?? '', address: values.address ?? '' });
            reset({ regionName: '', address: '', latitude: '', longitude: '' });
            handleClose();
        }
    };

    const handleCancel = () => {
        reset(defaultValues);
        handleClose();
    };

    const canSave =
        latitude != null && latitude !== '' && longitude != null && longitude !== '' &&
        !Number.isNaN(parseFloat(latitude)) && !Number.isNaN(parseFloat(longitude));

    return (
        <RSModal show={show} handleClose={handleCancel} size="xxlg" header="Map location"
            body={
                <FormProvider {...methods}>
                    <div className="location-map-modal-container">
                        <Row>
                            <Col sm={8}>
                                <div className="map-wrapper" style={{ minHeight: '400px' }}>
                                    <div style={{ width: '100%', height: '400px', borderRadius: 4, overflow: 'hidden', border: '1px solid #ddd' }}>
                                        {show && !mapReady && (
                                            <div style={{ width: '100%', height: '400px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="text-muted">Preparing map...</span>
                                            </div>
                                        )}
                                        {show && mapReady && (
                                            <MapContainer
                                                center={center}
                                                zoom={DEFAULT_ZOOM}
                                                style={{ height: '400px', width: '100%', minHeight: '400px' }}
                                                attributionControl={true}
                                                className="location-map-leaflet-container"
                                            >
                                                <TileLayer
                                                    url={TILE_LAYER_URL}
                                                    {...TILE_LAYER_OPTIONS}
                                                />
                                                <MapInvalidateSize isVisible={show} />
                                                <MapClickHandler onLocationSelect={handleMapClick} />
                                                <MapCenterController center={center} />
                                                {markerPosition && <Marker position={markerPosition} />}
                                            </MapContainer>
                                        )}
                                    </div>
                                </div>
                            </Col>
                            <Col sm={4}>
                                    <h3 className="rsmdc-header mb15">Location details</h3>
                                    <div className="box-design no-box-shadow">
                                        <div className="form-group mt13 rs-input-wrapper rs-input-placeholder-wrapper" style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                placeholder=" "
                                                className="emojifont"
                                                value={regionName || ''}
                                                onChange={onPlaceInputChange}
                                                onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                                                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 200)}
                                                autoComplete="off"
                                            />
                                            <label>Place name</label>
                                            {suggestionsOpen && suggestions.length > 0 && (
                                                <ul
                                                    className="list-group"
                                                    style={{
                                                        position: 'absolute', zIndex: 10, width: '100%', maxHeight: '200px', overflowY: 'auto',
                                                        marginTop: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 4,
                                                    }}
                                                >
                                                    {suggestions.map((item, idx) => (
                                                        <li
                                                            key={`${item.lat}-${item.lon}-${idx}`}
                                                            className="list-group-item list-group-item-action"
                                                            style={{ cursor: 'pointer', fontSize: 13 }}
                                                            onMouseDown={(e) => { e.preventDefault(); onSuggestionSelect(item); }}
                                                        >
                                                            {item.name && <div className="fw-semibold">{item.name}</div>}
                                                            <div className="text-muted small">{item.displayName}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <RSInput control={control} name="address" label="Address" />
                                        </div>
                                        <div className="form-group">
                                            <Row>
                                            <Col>
                                                <RSInput control={control} name="latitude" label="Latitude" required />
                                            </Col>
                                            <Col>
                                                <RSInput control={control} name="longitude" label="Longitude" required />
                                            </Col>
                                            </Row>
                                        </div>
                                        <small className="text-muted lh-sm">Click on the map to set location or enter coordinates manually.</small>
                                    </div>
                            </Col>
                        </Row>
                    </div>
                </FormProvider>
            }
            footer={
                <div className="buttons-holder m0">
                    <RSSecondaryButton onClick={handleCancel}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton className={canSave ? '' : 'click-off'} onClick={handleSave}>Add</RSPrimaryButton>
                </div>
            }
        />
    );
};

export default LeafletMapModal;