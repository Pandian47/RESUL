import { location_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { Row, Col } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSComboBox from 'Components/FormFields/RSComboBox';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useForm } from 'react-hook-form';
import {
    GOOGLE_MAPS_API_KEY,
    GOOGLE_MAPS_SCRIPT_ID,
    fetchPlacesSuggestions,
    fetchPlaceDetailsById,
    reverseGeocodeLatLng,
    pickDisplayPlaceName,
    getMapCenterFromIpAddressData,
    resolveDefaultMapCenter,
} from './geofencingGoogleMapsApi';

const PLACES_SEARCH_DEBOUNCE_MS = 300;

const normalizeLatLng = (latlng) => {
    if (!latlng) return null;
    const lat = parseFloat(latlng.lat);
    const lng = parseFloat(latlng.lng);

    if (isNaN(lat) || isNaN(lng)) return null;

    const normalizedLng = ((((lng + 180) % 360) + 360) % 360) - 180;
    const normalizedLat = Math.max(-85, Math.min(85, lat));

    return { lat: normalizedLat, lng: normalizedLng };
};

const isValidNumber = (value) => {
    if (value === null || value === undefined || value === '') return false;
    const num = parseFloat(value);
    return !isNaN(num);
};

const getValidInitialPosition = (initPos) => {
    if (!initPos) return null;
    const lat = parseFloat(initPos.lat ?? initPos.latitude);
    const lng = parseFloat(initPos.lng ?? initPos.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
        return normalizeLatLng({ lat, lng });
    }
    return null;
};

const mapContainerStyle = {
    height: '100%',
    width: '100%',
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    restriction: {
        latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
        strictBounds: true,
    },
    minZoom: 2,
};

const MapPicker = ({
    show,
    handleClose,
    onLocationPick,
    initialPosition = null,
}) => {
    const defaultZoom = 13;

    const { isLoaded, loadError } = useLoadScript({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    const validInitialPos = getValidInitialPosition(initialPosition);

    const initialPositionKey = useMemo(() => {
        if (!initialPosition) return '';
        const lat = initialPosition.lat ?? initialPosition.latitude;
        const lng = initialPosition.lng ?? initialPosition.longitude;
        return `${lat ?? ''},${lng ?? ''}`;
    }, [initialPosition]);

    const [position, setPosition] = useState(validInitialPos);
    const [radius, setRadius] = useState(
        isValidNumber(initialPosition?.radius) ? parseFloat(initialPosition.radius) : 100
    );
    const [placeName, setPlaceName] = useState(initialPosition?.placeName || '');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [center, setCenter] = useState(() => {
        const v = getValidInitialPosition(initialPosition);
        return v ? { lat: v.lat, lng: v.lng } : getMapCenterFromIpAddressData();
    });

    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);
    const mapRef = useRef(null);

    const { control, setValue, watch } = useForm({
        defaultValues: {
            radius: initialPosition?.radius || '100',
            locationSearch: null,
        },
    });

    const radiusValue = watch('radius');

    useEffect(() => {
        if (show) {
            const validPos = getValidInitialPosition(initialPosition);

            if (validPos) {
                setPosition(validPos);
                setRadius(isValidNumber(initialPosition.radius) ? parseFloat(initialPosition.radius) : 100);
                setPlaceName(initialPosition.placeName || '');
                setCenter({ lat: validPos.lat, lng: validPos.lng });
                setValue('radius', isValidNumber(initialPosition.radius) ? initialPosition.radius.toString() : '100');
            } else {
                setPosition(null);
                setRadius(100);
                setPlaceName('');
                setCenter(getMapCenterFromIpAddressData());
                setValue('radius', '100');
            }
            setValue('locationSearch', null);
            setSearchSuggestions([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, initialPosition, setValue]);

    useEffect(() => {
        const parsedRadius = parseFloat(radiusValue);
        if (!isNaN(parsedRadius) && parsedRadius > 0) {
            setRadius(parsedRadius);
        }
    }, [radiusValue]);

    // Center map only (no pin / no lat-lng until user picks or uses "My location").
    useEffect(() => {
        if (!show || !isLoaded) return;
        const vp = getValidInitialPosition(initialPosition);
        if (vp) return;
        let cancelled = false;
        resolveDefaultMapCenter().then((c) => {
            if (cancelled) return;
            setCenter(c);
            mapRef.current?.panTo(c);
        });
        return () => {
            cancelled = true;
        };
    }, [show, isLoaded, initialPositionKey]);

    const triggerResize = useCallback(() => {
        if (mapRef.current && window.google?.maps?.event) {
            window.google.maps.event.trigger(mapRef.current, 'resize');
        }
    }, []);

    useEffect(() => {
        if (!show || !isLoaded) return;
        [0, 150, 400].forEach((ms) => {
            setTimeout(triggerResize, ms);
        });
    }, [show, isLoaded, center, triggerResize]);

    const handleAddressSearch = async (searchText) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!searchText || searchText.trim().length < 2) {
            setSearchSuggestions([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const raw = await fetchPlacesSuggestions(searchText, center);
                const formattedData = raw.map((item, index) => {
                    if (item.isNominatim) {
                        return {
                            id: `osm-${index}-${item.lat}-${item.lng}`,
                            isNominatim: true,
                            placeId: null,
                            displayName: item.address || item.text,
                            shortName: item.mainText || item.placeName || '',
                            type: 'Location',
                            lat: item.lat,
                            lon: item.lng,
                            label: `${item.mainText || item.placeName || 'Place'} — OpenStreetMap`,
                        };
                    }
                    return {
                        id: index,
                        placeId: item.placeId,
                        displayName: item.text || [item.mainText, item.secondaryText].filter(Boolean).join(', '),
                        shortName: item.mainText || item.text || '',
                        type: 'Location',
                        lat: null,
                        lon: null,
                        label: `${item.mainText || item.text || 'Place'} — ${item.secondaryText || 'Google Places'}`,
                    };
                });

                setSearchSuggestions(formattedData);
            } catch {
                setSearchSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, PLACES_SEARCH_DEBOUNCE_MS);
    };

    const handleSearchSelect = async (e) => {
        const suggestion = e.value ?? e.target?.value;
        if (!suggestion) return;

        setIsSearching(true);
        try {
            let latlng = null;
            let nameFirst = '';

            if (suggestion.isNominatim && suggestion.lat != null && suggestion.lon != null) {
                latlng = normalizeLatLng({ lat: suggestion.lat, lng: suggestion.lon });
                nameFirst =
                    (suggestion.shortName && suggestion.shortName.split(',')[0].trim()) ||
                    suggestion.displayName?.split(',')[0]?.trim() ||
                    '';
            } else if (suggestion.placeId) {
                const detail = await fetchPlaceDetailsById(suggestion.placeId);
                if (!detail) return;
                latlng = normalizeLatLng({ lat: detail.lat, lng: detail.lng });
                nameFirst =
                    (detail.placeName && detail.placeName.split(',')[0].trim()) ||
                    suggestion.shortName ||
                    suggestion.displayName?.split(',')[0]?.trim() ||
                    '';
            }

            if (!latlng) return;

            setPosition(latlng);
            setCenter({ lat: latlng.lat, lng: latlng.lng });
            setPlaceName(nameFirst);

            if (mapRef.current) {
                mapRef.current.panTo(latlng);
                mapRef.current.setZoom(defaultZoom);
            }
        } finally {
            setIsSearching(false);
            setTimeout(() => {
                setValue('locationSearch', null);
            }, 100);
        }
    };

    const handleLocationSelect = useCallback(async (latlng) => {
        setPosition(latlng);
        setCenter({ lat: latlng.lat, lng: latlng.lng });

        try {
            const geo = await reverseGeocodeLatLng(latlng.lat, latlng.lng);
            setPlaceName(pickDisplayPlaceName(geo, latlng.lat, latlng.lng, 6));
        } catch {
            setPlaceName(pickDisplayPlaceName(null, latlng.lat, latlng.lng, 6));
        }
    }, []);

    const onMapClick = useCallback(
        (e) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const normalizedLatLng = normalizeLatLng({ lat, lng });
            if (normalizedLatLng) {
                handleLocationSelect(normalizedLatLng);
            }
        },
        [handleLocationSelect]
    );

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const handleGetCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const latlng = normalizeLatLng({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                    if (!latlng) {
                        setIsLoadingLocation(false);
                        return;
                    }
                    setPosition(latlng);
                    setCenter({ lat: latlng.lat, lng: latlng.lng });
                    if (mapRef.current) {
                        mapRef.current.panTo(latlng);
                        mapRef.current.setZoom(defaultZoom);
                    }

                    try {
                        const geo = await reverseGeocodeLatLng(latlng.lat, latlng.lng);
                        setPlaceName(pickDisplayPlaceName(geo, latlng.lat, latlng.lng, 6));
                    } catch {
                        setPlaceName(pickDisplayPlaceName(null, latlng.lat, latlng.lng, 6));
                    }
                    setIsLoadingLocation(false);
                },
                () => {
                    alert('Unable to get your current location. Please click on the map to select a location.');
                    setIsLoadingLocation(false);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
            setIsLoadingLocation(false);
        }
    };

    const handleConfirm = () => {
        if (!position) {
            alert('Please select a location on the map.');
            return;
        }

        const parsedRadius = parseFloat(radiusValue);
        if (!parsedRadius || parsedRadius <= 0) {
            alert('Please enter a valid radius greater than 0.');
            return;
        }

        const validPosition = normalizeLatLng(position);
        if (!validPosition) {
            alert('Selected location is invalid. Please pick a valid point on the map.');
            return;
        }

        onLocationPick({
            placeName: placeName || `Location: ${validPosition.lat.toFixed(6)}, ${validPosition.lng.toFixed(6)}`,
            latitude: validPosition.lat.toFixed(6),
            longitude: validPosition.lng.toFixed(6),
            radius: parsedRadius.toString(),
        });

        handleClose();
    };

    const renderMapBody = () => {
        if (loadError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>
                    Could not load Google Maps. Check REACT_APP_GOOGLE_MAPS_API_KEY and enabled APIs (Maps JavaScript API,
                    Geocoding API, Places API).
                </div>
            );
        }
        if (!isLoaded) {
            return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <span className="spinner-border spinner-border-sm mr5" role="status" />
                    Loading map…
                </div>
            );
        }
        return (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={defaultZoom}
                options={mapOptions}
                onClick={onMapClick}
                onLoad={onMapLoad}
            >
                {position && (
                    <>
                        <Marker position={position} />
                        <Circle
                            center={position}
                            radius={radius}
                            options={{
                                strokeColor: '#3388ff',
                                strokeOpacity: 0.9,
                                strokeWeight: 2,
                                fillColor: '#3388ff',
                                fillOpacity: 0.2,
                            }}
                        />
                    </>
                )}
            </GoogleMap>
        );
    };

    return (
        <RSModal
            show={show}
            size="xl"
            header="Pick Location"
            handleClose={handleClose}
            isCloseButton={true}
            body={
                <div>
                    <Row className="mb15">
                        <Col sm={12}>
                            <RSComboBox
                                name="locationSearch"
                                control={control}
                                data={searchSuggestions}
                                textField="label"
                                dataItemKey="id"
                                label="Search for a place, city, region, or locality"
                                placeholder="Type to search… (Google first, then OpenStreetMap if needed)"
                                handleChange={handleSearchSelect}
                                filterable={true}
                                onFilterChange={(e) => {
                                    const searchValue = e.filter.value;
                                    handleAddressSearch(searchValue);
                                }}
                                suggest={true}
                                className="mb10"
                                itemRender={(li, itemProps) => {
                                    const item = itemProps.dataItem;
                                    return (
                                        <li
                                            {...li.props}
                                            style={{
                                                padding: '8px 12px',
                                                borderBottom: '1px solid #f0f0f0',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <i
                                                    className={`${location_mini} icon-sm mr10`}
                                                    style={{ color: '#666', marginTop: '2px' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                                                        {item.shortName}
                                                        <span
                                                            style={{
                                                                fontSize: '11px',
                                                                color: '#fff',
                                                                backgroundColor:
                                                                    item.type === 'Locality'
                                                                        ? '#28a745'
                                                                        : item.type === 'Region'
                                                                          ? '#007bff'
                                                                          : '#6c757d',
                                                                padding: '2px 6px',
                                                                borderRadius: '3px',
                                                                marginLeft: '8px',
                                                                fontWeight: 'normal',
                                                            }}
                                                        >
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                        {item.displayName}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                }}
                            />
                            {isSearching && (
                                <div style={{ textAlign: 'center', padding: '5px', color: '#666' }}>
                                    <span className="spinner-border spinner-border-sm mr5" role="status" />
                                    Searching...
                                </div>
                            )}
                        </Col>
                    </Row>

                    <Row className="mb15">
                        <Col sm={12}>
                            <RSSecondaryButton onClick={handleGetCurrentLocation} disabled={isLoadingLocation}>
                                {isLoadingLocation ? 'Getting location...' : 'Use My Current Location'}
                            </RSSecondaryButton>
                            <span className="ml15 text-muted">or click anywhere on the map to select a location</span>
                        </Col>
                    </Row>

                    <Row className="mb15">
                        <Col sm={12}>
                            <div
                                style={{
                                    height: '500px',
                                    width: '100%',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                }}
                            >
                                {renderMapBody()}
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb10">
                        <Col sm={3} className="text-right">
                            <label className="control-label-left">Place name</label>
                        </Col>
                        <Col sm={9}>
                            <input
                                type="text"
                                className="form-control"
                                value={placeName}
                                onChange={(e) => setPlaceName(e.target.value)}
                                placeholder="Enter place name or select location on map"
                            />
                        </Col>
                    </Row>

                    {position && (
                        <>
                            <Row className="mb10">
                                <Col sm={3} className="text-right">
                                    <label className="control-label-left">Latitude</label>
                                </Col>
                                <Col sm={9}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={position.lat.toFixed(6)}
                                        readOnly
                                    />
                                </Col>
                            </Row>

                            <Row className="mb10">
                                <Col sm={3} className="text-right">
                                    <label className="control-label-left">Longitude</label>
                                </Col>
                                <Col sm={9}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={position.lng.toFixed(6)}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    <Row className="mb10">
                        <Col sm={3} className="text-right">
                            <label className="control-label-left">Radius (m)</label>
                        </Col>
                        <Col sm={9}>
                            <RSInput
                                name="radius"
                                control={control}
                                placeholder="Enter radius in meters"
                                required
                                rules={{
                                    required: 'Enter radius',
                                    validate: (v) => {
                                        const num = parseFloat(v);
                                        return (!isNaN(num) && num > 0) || 'Radius must be greater than 0';
                                    },
                                }}
                                onKeyDown={(e) => {
                                    const allowed = /[0-9\.]/;
                                    if (e.key.length === 1 && !allowed.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Col>
                    </Row>
                </div>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={handleClose}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton onClick={handleConfirm}>Confirm Location</RSPrimaryButton>
                </>
            }
        />
    );
};

export default MapPicker;
