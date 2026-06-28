import { downloadCSV } from 'Utils/modules/download';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ACTIONS, CONFIRM, DELETE, EDIT, LATITUDE, LONGITUDE, PLACE_NAME, RADIUS, UPLOAD_REGION_FILE } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, builder_upload_large, builder_upload_medium, circle_close_mini, circle_minus_fill_edge_medium, circle_plus_fill_edge_medium, circle_question_mark_mini, circle_tick_medium, close_mini, delete_medium, download_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { GoogleMap, Marker, Circle, InfoWindow, useLoadScript } from '@react-google-maps/api';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import KendoGrid from 'Components/RSKendoGrid';
import { checkValidGeoFence } from 'Reducers/preferences/CommunicationSettings/Geofencing/request';
import MapPicker from './MapPicker';
//import MapModal from '../../../../../../Audience/Pages/DynamicListCreation/Component/MapModal/MapModal';
import MapModal from 'Pages/AuthenticationModule/Audience/Pages/DynamicListCreation/Component/MapModal/MapModal';
import RegionUpload from '../Upload/RegionUpload';

import RSConfirmationModal from 'Components/ConfirmationModal';
import {
    GOOGLE_MAPS_API_KEY,
    GOOGLE_MAPS_SCRIPT_ID,
    FALLBACK_GEOFENCING_MAP_CENTER,
    reverseGeocodeLatLng,
    pickDisplayPlaceName,
    fetchPlacesSuggestions,
    fetchPlaceDetailsById,
    getMapCenterFromIpAddressData,
    resolveDefaultMapCenter,
} from './geofencingGoogleMapsApi';

const PLACE_SEARCH_DEBOUNCE_MS = 300;

const MapsScriptFailureHelp = ({ detail }) => (
    <div
        style={{
            padding: '20px',
            textAlign: 'left',
            maxWidth: '540px',
            margin: '0 auto',
            color: '#333',
            height: '100%',
            overflow: 'auto',
        }}
    >
        <p style={{ color: '#dc3545', fontWeight: 600, marginBottom: '12px' }}>Google Maps did not load</p>
        {detail ? (
            <p style={{ fontSize: '13px', marginBottom: '12px', wordBreak: 'break-word' }}>
                <strong>Loader message:</strong> {detail}
            </p>
        ) : null}
        <p style={{ fontSize: '13px', marginBottom: '8px' }}>
            Open DevTools → <strong>Network</strong>, filter by <code>maps.googleapis</code>. If the script returns{' '}
            <strong>403 Forbidden</strong>, Google rejected your API key (this is configured in Google Cloud, not in
            this form).
        </p>
        <ul style={{ fontSize: '13px', paddingLeft: '18px', margin: 0 }}>
            <li>
                Enable <strong>Maps JavaScript API</strong> (and <strong>Geocoding API</strong> for address search) on
                the key&apos;s Google Cloud project.
            </li>
            <li>Enable <strong>billing</strong> for that project.</li>
            <li>
                Key restrictions → <strong>HTTP referrers</strong>: add your dev URLs, e.g.{' '}
                <code>http://localhost:4000/*</code> and <code>http://127.0.0.1:4000/*</code> (use the same port as in
                the address bar).
            </li>
            <li>
                Set <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> to that key in <code>.env</code> and restart{' '}
                <code>npm start</code>.
            </li>
        </ul>
    </div>
);

const normalizeLatLng = (latlng) => {
    if (!latlng) return null;
    const lat = parseFloat(latlng.lat);
    const lng = parseFloat(latlng.lng);
    if (isNaN(lat) || isNaN(lng)) return null;

    const normalizedLng = ((((lng + 180) % 360) + 360) % 360) - 180;
    const normalizedLat = Math.max(-85, Math.min(85, lat));
    return { lat: normalizedLat, lng: normalizedLng };
};

const getMapCenterFromExistingRegions = (regions) => {
    if (!Array.isArray(regions) || regions.length === 0) {
        return getMapCenterFromIpAddressData();
    }
    const points = regions
        .map((r) => ({
            lat: parseFloat(r?.latitude),
            lng: parseFloat(r?.longitude),
        }))
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (points.length === 0) {
        return getMapCenterFromIpAddressData();
    }
    if (points.length === 1) {
        return { lat: points[0].lat, lng: points[0].lng };
    }
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    return {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
};

/** Single-region bounds are a point; fitBounds would zoom to max. Pad to ~0.8 km span. */
const padLatLngBoundsForFit = (swLat, swLng, neLat, neLng) => {
    const MIN_DEG = 0.007;
    let a0 = swLat;
    let o0 = swLng;
    let a1 = neLat;
    let o1 = neLng;
    if (a1 - a0 < MIN_DEG) {
        const m = (a0 + a1) / 2;
        a0 = m - MIN_DEG / 2;
        a1 = m + MIN_DEG / 2;
    }
    if (o1 - o0 < MIN_DEG) {
        const m = (o0 + o1) / 2;
        o0 = m - MIN_DEG / 2;
        o1 = m + MIN_DEG / 2;
    }
    return { swLat: a0, swLng: o0, neLat: a1, neLng: o1 };
};

const sanitizeMapCenter = (c) => {
    const lat = Number(c?.lat);
    const lng = Number(c?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {
            lat: Math.max(-85, Math.min(85, lat)),
            lng: ((((lng + 180) % 360) + 360) % 360) - 180,
        };
    }
    return { ...FALLBACK_GEOFENCING_MAP_CENTER };
};

const addRegionMapContainerStyle = {
    height: '100%',
    width: '100%',
    borderRadius: 'var(--globalBorderRadius)',
};

const addRegionMapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
    minZoom: 2,
};

const MAX_CUSTOM_DATA = 5;
const MAX_REGIONS = 50;

/** Built-in geofence custom-data attribute tags (dropdown ids 0–2). */
const GEOFENCE_BUILTIN_TAGS = [
    { id: 0, value: 'DEVICE_OS' },
    { id: 1, value: 'DEVICE_TYPE' },
    { id: 2, value: 'APP_VERSION' },
];

const GEOFENCE_CUSTOM_DROPDOWN_OPTION = { id: 1000, value: 'CUSTOM' };

/** User-defined attribute names added via CUSTOM option use ids starting here. */
const USER_CUSTOM_TAG_ID_START = 1001;

const getGeofenceTagsForMatching = () => [...GEOFENCE_BUILTIN_TAGS, GEOFENCE_CUSTOM_DROPDOWN_OPTION];

const isBuiltinGeofenceTagId = (id) => id != null && Number(id) >= 0 && Number(id) <= 2;

/**
 * Maps loaded form/API rows to dropdown keys + collects user tag definitions for the attribute list.
 * Mutates startIdRef (assigns ids for newly discovered string keys).
 */
const normalizeLoadedCustomDataRows = (customDataRows, startIdRef) => {
    const builtinsByValue = new Map(GEOFENCE_BUILTIN_TAGS.map((t) => [t.value.toLowerCase(), t]));
    const newUserTags = [];
    const byNameLower = new Map();

    const normalized = customDataRows.map((row) => {
        const key = row.key;
        if (key && typeof key === 'object' && key.id != null && key.id !== GEOFENCE_CUSTOM_DROPDOWN_OPTION.id) {
            if (key.id >= USER_CUSTOM_TAG_ID_START) {
                const low = key.value?.toLowerCase();
                if (low && !byNameLower.has(low)) {
                    byNameLower.set(low, key);
                    newUserTags.push(key);
                }
            }
            return { ...row, key, isDropdown: row.isDropdown !== false };
        }
        if (typeof key === 'string' && key.trim()) {
            const trimmed = key.trim();
            const low = trimmed.toLowerCase();
            const builtin = builtinsByValue.get(low);
            if (builtin) {
                return { ...row, key: builtin, isDropdown: true };
            }
            let tag = byNameLower.get(low);
            if (!tag) {
                tag = { id: startIdRef.current++, value: trimmed };
                byNameLower.set(low, tag);
                newUserTags.push(tag);
            }
            return { ...row, key: tag, isDropdown: true };
        }
        return row;
    });

    return { normalized, newUserTags };
};

const DEFAULT_VALUES = {
    placeName: '',
    latitude: '',
    longitude: '',
    radius: '200',
    customDataEnabled: false,
    customData: [
        { key: '', value: '', isDropdown: true },
    ],
};

const AddRegion = ({
    show,
    handleClose = () => { },
    onAdd = () => { },
    onDelete = () => { }, // Callback to delete region from parent
    onEdit = () => { }, // Callback to edit region (set editIndex in parent)
    attributeOptions = [], // expects list of attributes for dropdown
    initialValues, // when provided, pre-fill form for edit
    // Props for API validation
    geoFenceId = 0,
    clusterName = '',
    dateInfo = { startDate: null, endDate: null, isAllTime: true },
    mobileApp = null,
    existingRegions = [],
    editIndex = null,
}) => {
    const dispatch = useDispatch();
    const methods = useForm({ defaultValues: DEFAULT_VALUES, mode: 'onChange' });
    const { control, handleSubmit, watch, setValue, getValues, trigger, setError: setFormError, clearErrors: clearFormErrors } = methods;
    const { fields, append, remove, update } = useFieldArray({ control, name: 'customData' });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [localEditIndex, setLocalEditIndex] = useState(null); // Store edit index when editing from grid
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [mapInitialPosition, setMapInitialPosition] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0); // 0 for manual, 1 for map
    const [showMapModal, setShowMapModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deleteRegionIndex, setDeleteRegionIndex] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userCustomAttributeTags, setUserCustomAttributeTags] = useState([]);
    const nextUserCustomTagIdRef = useRef(USER_CUSTOM_TAG_ID_START);

    // Map state (Google Maps – lat/lng objects; default from ipAddressData in localStorage)
    const defaultZoom = 13;
    const [mapPosition, setMapPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState(() => getMapCenterFromIpAddressData());
    const [mapRadius, setMapRadius] = useState(100);
    const [shouldFitBounds, setShouldFitBounds] = useState(true);
    const [selectedInfoRegion, setSelectedInfoRegion] = useState(null);
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);

    const mapsKeyMissing = !String(GOOGLE_MAPS_API_KEY || '').trim();

    const { isLoaded: isGoogleMapLoaded, loadError: googleMapLoadError } = useLoadScript({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    const [mapsScriptTimedOut, setMapsScriptTimedOut] = useState(false);
    useEffect(() => {
        if (!show) {
            setMapsScriptTimedOut(false);
            return;
        }
        if (isGoogleMapLoaded || googleMapLoadError) {
            setMapsScriptTimedOut(false);
            return;
        }
        const t = window.setTimeout(() => setMapsScriptTimedOut(true), 10000);
        return () => window.clearTimeout(t);
    }, [show, isGoogleMapLoaded, googleMapLoadError]);

    const [placeSuggestions, setPlaceSuggestions] = useState([]);
    const [placeSuggestionsOpen, setPlaceSuggestionsOpen] = useState(false);
    const placeSearchDebounceRef = useRef(null);

    const mapCenterSafe = useMemo(() => sanitizeMapCenter(mapCenter), [mapCenter]);

    // Reset values whenever modal is shown or initialValues change
    useEffect(() => {
        if (!show) {
            setSuccessMessage('');
            setErrorMessage('');
            setActiveTabIndex(0);
            setShowMapModal(false);
            setMapPosition(null);
            setMapCenter(getMapCenterFromIpAddressData());
            setMapRadius(100);
            setShouldFitBounds(true);
            setPlaceSuggestions([]);
            setPlaceSuggestionsOpen(false);
            setUserCustomAttributeTags([]);
            nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
            if (placeSearchDebounceRef.current) {
                clearTimeout(placeSearchDebounceRef.current);
            }
            return;
        }

        // Determine if we're in edit mode
        const editMode = !!initialValues;
        setIsEditMode(editMode);

        if (initialValues) {
            const hasCustom = Array.isArray(initialValues?.customData)
                ? initialValues.customData.some((cd) => {
                    const keyFilled = cd && (cd.key?.id !== undefined || (typeof cd.key === 'string' && cd.key.trim() !== ''));
                    const valueFilled = cd && typeof cd.value === 'string' && cd.value.trim() !== '';
                    return keyFilled || valueFilled;
                })
                : false;

            const mappedCustomRows = hasCustom
                ? initialValues.customData.map((cd) => ({
                    key: cd?.key || '',
                    value: cd?.value || '',
                    isDropdown: cd?.isDropdown === false ? false : true,
                }))
                : [{ key: '', value: '', isDropdown: true }];

            nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
            const { normalized: normalizedCustom, newUserTags } = hasCustom
                ? normalizeLoadedCustomDataRows(mappedCustomRows, nextUserCustomTagIdRef)
                : { normalized: mappedCustomRows, newUserTags: [] };

            const preset = {
                placeName: initialValues?.placeName || '',
                latitude: initialValues?.latitude || '',
                longitude: initialValues?.longitude || '',
                radius: initialValues?.radius || '100',
                customDataEnabled: !!hasCustom,
                customData: normalizedCustom,
            };
            methods.reset(preset);
            setUserCustomAttributeTags(newUserTags);

            // Set map position if lat/lng exist
            if (initialValues?.latitude && initialValues?.longitude) {
                const lat = parseFloat(initialValues.latitude);
                const lng = parseFloat(initialValues.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setMapPosition({ lat, lng });
                    setMapCenter({ lat, lng });
                    const radius = parseFloat(initialValues.radius || '100');
                    setMapRadius(isNaN(radius) ? 100 : radius);
                    setShouldFitBounds(false); // Don't fit bounds when editing a specific region
                }
            }
        } else {
            setUserCustomAttributeTags([]);
            nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
            methods.reset(DEFAULT_VALUES);
            setMapPosition(null);
            setMapCenter(getMapCenterFromExistingRegions(existingRegions));
            setMapRadius(100);

            // If there are existing regions, fit bounds to show all of them
            if (Array.isArray(existingRegions) && existingRegions.length > 0) {
                setShouldFitBounds(true);
            } else {
                // No existing regions, use default center and zoom
                setShouldFitBounds(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, initialValues]);

    // Watch radius changes to update map radius
    const radiusValue = watch('radius');
    useEffect(() => {
        const parsedRadius = parseFloat(radiusValue);
        if (!isNaN(parsedRadius) && parsedRadius > 0) {
            setMapRadius(parsedRadius);
        }
    }, [radiusValue]);

    // Watch latitude and longitude changes to automatically update map position
    const latitudeValue = watch('latitude');
    const longitudeValue = watch('longitude');
    useEffect(() => {
        // Only update if both lat and lng are provided and valid
        if (!latitudeValue || !longitudeValue) {
            return;
        }

        const lat = parseFloat(latitudeValue);
        const lng = parseFloat(longitudeValue);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return;
        }

        // Update map position and center
        setMapPosition({ lat, lng });
        setMapCenter({ lat, lng });
        setShouldFitBounds(false); // Don't fit bounds, just center on entered coordinates
    }, [latitudeValue, longitudeValue]);

    const placeSearchCenter = useMemo(() => {
        const lat = parseFloat(latitudeValue);
        const lng = parseFloat(longitudeValue);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            return { lat, lng };
        }
        return mapCenterSafe;
    }, [latitudeValue, longitudeValue, mapCenterSafe]);

    const onPlaceNameInputChange = useCallback(
        (e) => {
            const value = e.target.value;
            setValue('placeName', value, { shouldValidate: true });
            if (placeSearchDebounceRef.current) {
                clearTimeout(placeSearchDebounceRef.current);
            }
            if (!value.trim()) {
                setPlaceSuggestions([]);
                setPlaceSuggestionsOpen(false);
                return;
            }
            placeSearchDebounceRef.current = setTimeout(() => {
                fetchPlacesSuggestions(value, placeSearchCenter).then((list) => {
                    setPlaceSuggestions(list);
                    setPlaceSuggestionsOpen(list.length > 0);
                });
            }, PLACE_SEARCH_DEBOUNCE_MS);
        },
        [setValue, placeSearchCenter]
    );

    const onPlaceSuggestionSelect = useCallback(
        async (item) => {
            setPlaceSuggestions([]);
            setPlaceSuggestionsOpen(false);
            if (item.isNominatim) {
                const lat = item.lat;
                const lng = item.lng;
                if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
                    return;
                }
                const normalized = normalizeLatLng({ lat, lng });
                if (!normalized) return;
                setMapPosition(normalized);
                setMapCenter({ lat: normalized.lat, lng: normalized.lng });
                setShouldFitBounds(false);
                setLocalEditIndex(null);
                setIsEditMode(false);
                if (onEdit) {
                    onEdit(null);
                }
                setValue('latitude', normalized.lat.toFixed(20), { shouldValidate: true, shouldDirty: true });
                setValue('longitude', normalized.lng.toFixed(20), { shouldValidate: true, shouldDirty: true });
                const pn = (item.placeName || item.mainText || '').trim().slice(0, MAX_LENGTH50);
                setValue('placeName', pn, { shouldValidate: true, shouldDirty: true });
                return;
            }
            const details = await fetchPlaceDetailsById(item.placeId);
            if (!details) return;
            const normalized = normalizeLatLng({ lat: details.lat, lng: details.lng });
            if (!normalized) return;
            setMapPosition(normalized);
            setMapCenter({ lat: normalized.lat, lng: normalized.lng });
            setShouldFitBounds(false);
            setLocalEditIndex(null);
            setIsEditMode(false);
            if (onEdit) {
                onEdit(null);
            }
            setValue('latitude', normalized.lat.toFixed(20), { shouldValidate: true, shouldDirty: true });
            setValue('longitude', normalized.lng.toFixed(20), { shouldValidate: true, shouldDirty: true });
            const nameFromDetails = (details.placeName || item.mainText || item.text || '')
                .split(',')[0]
                .trim()
                .slice(0, MAX_LENGTH50);
            setValue('placeName', nameFromDetails, { shouldValidate: true, shouldDirty: true });
        },
        [setValue, onEdit]
    );

    // Calculate bounds from existing regions to fit all on map
    const mapBounds = useMemo(() => {
        if (!Array.isArray(existingRegions) || existingRegions.length === 0) {
            return null;
        }

        const validRegions = existingRegions
            .filter((region, index) => {
                // Exclude the region being edited if in edit mode
                if (isEditMode && editIndex !== null && editIndex === index) {
                    return false;
                }
                const lat = parseFloat(region?.latitude);
                const lng = parseFloat(region?.longitude);
                return !isNaN(lat) && !isNaN(lng);
            })
            .map(region => [
                parseFloat(region.latitude),
                parseFloat(region.longitude)
            ]);

        // Also include current map position if it exists
        if (mapPosition) {
            validRegions.push([mapPosition.lat, mapPosition.lng]);
        }

        if (validRegions.length === 0) {
            return null;
        }

        // Calculate bounds
        const lats = validRegions.map(coord => coord[0]);
        const lngs = validRegions.map(coord => coord[1]);

        return [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
        ];
    }, [existingRegions, mapPosition, isEditMode, editIndex]);

    // Handle map zoom when modal opens with existing regions
    useEffect(() => {
        if (show && !initialValues) {
            // Modal opened in add mode
            if (Array.isArray(existingRegions) && existingRegions.length > 0 && mapBounds) {
                // There are existing regions - ensure we fit bounds
                setShouldFitBounds(true);
            } else {
                // No existing regions - use default center and zoom
                setShouldFitBounds(false);
            }
        }
    }, [show, existingRegions, mapBounds, initialValues]);

    const onGoogleMapLoad = useCallback((map) => {
        mapRef.current = map;
        setMapInstance(map);
    }, []);

    useEffect(() => {
        if (!show) {
            setMapInstance(null);
            mapRef.current = null;
            setSelectedInfoRegion(null);
            setPlaceSuggestions([]);
            setPlaceSuggestionsOpen(false);
        }
    }, [show]);

    useEffect(() => {
        if (!isGoogleMapLoaded || !mapInstance || !show || !window.google?.maps) return;
        const map = mapInstance;
        if (shouldFitBounds && mapBounds) {
            try {
                const swLat = mapBounds[0][0];
                const swLng = mapBounds[0][1];
                const neLat = mapBounds[1][0];
                const neLng = mapBounds[1][1];
                if (![swLat, swLng, neLat, neLng].every(Number.isFinite)) {
                    map.panTo(mapCenterSafe);
                    map.setZoom(defaultZoom);
                    return;
                }
                const p = padLatLngBoundsForFit(swLat, swLng, neLat, neLng);
                if (![p.swLat, p.swLng, p.neLat, p.neLng].every(Number.isFinite)) {
                    map.panTo(mapCenterSafe);
                    map.setZoom(defaultZoom);
                    return;
                }
                const b = new window.google.maps.LatLngBounds(
                    { lat: p.swLat, lng: p.swLng },
                    { lat: p.neLat, lng: p.neLng }
                );
                map.fitBounds(b, { top: 72, right: 72, bottom: 72, left: 72 });
            } catch {
                map.panTo(mapCenterSafe);
                map.setZoom(defaultZoom);
            }
        } else {
            map.panTo(mapCenterSafe);
            map.setZoom(defaultZoom);
        }
    }, [
        isGoogleMapLoaded,
        mapInstance,
        show,
        shouldFitBounds,
        mapBounds,
        mapCenterSafe.lat,
        mapCenterSafe.lng,
        defaultZoom,
    ]);

    const triggerMapResize = useCallback(() => {
        if (mapRef.current && window.google?.maps?.event) {
            window.google.maps.event.trigger(mapRef.current, 'resize');
        }
    }, []);

    useEffect(() => {
        if (!show || !isGoogleMapLoaded || !mapInstance) return;
        const timeouts = [0, 100, 300, 550, 900].map((ms) => setTimeout(triggerMapResize, ms));
        return () => timeouts.forEach(clearTimeout);
    }, [show, isGoogleMapLoaded, mapInstance, triggerMapResize]);

    // Handle tab change
    useEffect(() => {
        if (activeTabIndex === 1 && show) {
            setShowMapModal(true);
        } else {
            setShowMapModal(false);
        }
    }, [activeTabIndex, show]);

    const customDataEnabled = watch('customDataEnabled');

    const ATTRIBUTE_DROPDOWN_ORDER_FIELD = '_attributeDropdownOrder';

    const getFilteredTags = useCallback(
        (currentIndex) => {
            const selectedIds = fields
                .filter((_, i) => i !== currentIndex)
                .map((item) => item?.key?.id)
                .filter((id) => id != null && id !== GEOFENCE_CUSTOM_DROPDOWN_OPTION.id);

            const nonCustomTags = [...GEOFENCE_BUILTIN_TAGS, ...userCustomAttributeTags].filter(
                (tag) => !selectedIds.includes(tag.id),
            );

            const ordered = nonCustomTags.map((tag, idx) => ({
                ...tag,
                [ATTRIBUTE_DROPDOWN_ORDER_FIELD]: idx,
            }));

            return [
                ...ordered,
                {
                    ...GEOFENCE_CUSTOM_DROPDOWN_OPTION,
                    [ATTRIBUTE_DROPDOWN_ORDER_FIELD]: 999999,
                },
            ];
        },
        [fields, userCustomAttributeTags],
    );

    const commitCustomAttributeName = useCallback(
        (index) => {
            const raw = getValues(`customData[${index}].key`);
            const trimmed = typeof raw === 'string' ? raw.trim() : '';
            if (!trimmed) {
                setFormError(`customData[${index}].key`, { type: 'manual', message: 'Enter attribute name' });
                return;
            }
            clearFormErrors(`customData[${index}].key`);

            if (GEOFENCE_BUILTIN_TAGS.some((t) => t.value.toLowerCase() === trimmed.toLowerCase())) {
                setFormError(`customData[${index}].key`, {
                    type: 'manual',
                    message: 'Use predefined attribute from the list',
                });
                return;
            }

            if (userCustomAttributeTags.some((t) => t.value.toLowerCase() === trimmed.toLowerCase())) {
                setFormError(`customData[${index}].key`, { type: 'manual', message: ' Name already exists.' });
                return;
            }

            const currentValues = getValues('customData');
            const dupRow = currentValues.some((item, idx) => {
                if (idx === index || !item.key) return false;
                const k =
                    typeof item.key === 'string' ? item.key.trim() : item.key?.value?.trim?.();
                return k && k.toLowerCase() === trimmed.toLowerCase();
            });
            if (dupRow) {
                setFormError(`customData[${index}].key`, { type: 'manual', message: ' Name already exists.' });
                return;
            }

            const id = nextUserCustomTagIdRef.current++;
            const newTag = { id, value: trimmed };
            setUserCustomAttributeTags((prev) => [...prev, newTag]);

            const fieldSnapshot = fields[index];
            update(index, {
                ...fieldSnapshot,
                id,
                key: newTag,
                isDropdown: true,
                value: trimmed,
            });
            setValue(`customData[${index}].key`, newTag, { shouldValidate: true });
            setValue(`customData[${index}].value`, trimmed, { shouldValidate: true });
        },
        [getValues, fields, update, setValue, userCustomAttributeTags, setFormError, clearFormErrors],
    );

    // Watch MapModal form fields and sync to AddRegion fields
    const mapRegionName = watch('geofenceRegion.regionName');
    const mapLatitude = watch('geofenceRegion.latitude');
    const mapLongitude = watch('geofenceRegion.longitude');
    const mapRadiusValue = watch('geofenceRegion.radiusValue');

    // Sync MapModal data to AddRegion form when MapModal fields change
    useEffect(() => {
        if (activeTabIndex === 1 && mapRegionName && mapLatitude && mapLongitude) {
            setValue('placeName', mapRegionName || '');
            setValue('latitude', mapLatitude || '');
            setValue('longitude', mapLongitude || '');
            if (mapRadiusValue) {
                // Convert radius to meters if needed (MapModal uses different units)
                const radiusInMeters = parseFloat(mapRadiusValue);
                if (!isNaN(radiusInMeters)) {
                    setValue('radius', radiusInMeters.toString());
                }
            }
        }
    }, [mapRegionName, mapLatitude, mapLongitude, mapRadiusValue, activeTabIndex, setValue]);

    // Render Manual Tab Content
    const renderManualTab = () => {
        const customDataRowsWatch = watch('customData');

        return (
            <Row>
                {/* Map Column - 8 columns */}
                <Col sm={8}>
                    <div className="add-region__map-wrap">
                        {!show ? (
                            <div className="add-region__map-placeholder" aria-hidden />
                        ) : mapsKeyMissing ? (
                            <MapsScriptFailureHelp detail="REACT_APP_GOOGLE_MAPS_API_KEY is empty. Add it to .env and restart the dev server." />
                        ) : googleMapLoadError || mapsScriptTimedOut ? (
                            <MapsScriptFailureHelp
                                detail={
                                    googleMapLoadError
                                        ? googleMapLoadError instanceof Error
                                            ? googleMapLoadError.message
                                            : String(googleMapLoadError)
                                        : 'The map script is taking too long or failed silently. Check the Network tab for maps.googleapis.com (often HTTP 403).'
                                }
                            />
                        ) : !isGoogleMapLoaded ? (
                            <div className="add-region__map-loading">
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden />
                                <span>Loading map…</span>
                            </div>
                        ) : (
                            <GoogleMap
                                mapContainerStyle={addRegionMapContainerStyle}
                                center={mapCenterSafe}
                                zoom={defaultZoom}
                                options={addRegionMapOptions}
                                onLoad={onGoogleMapLoad}
                                key="geofencing-add-region-map"
                            >
                                {Array.isArray(existingRegions) &&
                                    existingRegions
                                        .filter((region, index) => {
                                            if (isEditMode && editIndex !== null && editIndex === index) {
                                                return false;
                                            }
                                            const lat = parseFloat(region?.latitude);
                                            const lng = parseFloat(region?.longitude);
                                            const radius = parseFloat(region?.radius);
                                            return !isNaN(lat) && !isNaN(lng) && !isNaN(radius) && radius > 0;
                                        })
                                        .map((region, index) => {
                                            const lat = parseFloat(region.latitude);
                                            const lng = parseFloat(region.longitude);
                                            const radius = parseFloat(region.radius);
                                            const placeName = region.placeName || `Region ${index + 1}`;
                                            const onSelectExisting = () => {
                                                setSelectedInfoRegion(region);
                                                handleExistingRegionClick(region);
                                            };
                                            return (
                                                <Fragment key={`existing-region-${index}`}>
                                                    <Marker
                                                        position={{ lat, lng }}
                                                        title={placeName}
                                                        onClick={onSelectExisting}
                                                    />
                                                    <Circle
                                                        center={{ lat, lng }}
                                                        radius={radius}
                                                        options={{
                                                            strokeColor: '#ff9800',
                                                            strokeOpacity: 0.9,
                                                            strokeWeight: 2,
                                                            fillColor: '#ff9800',
                                                            fillOpacity: 0.2,
                                                        }}
                                                        onClick={onSelectExisting}
                                                    />
                                                </Fragment>
                                            );
                                        })}

                                {mapPosition && (
                                    <>
                                        <Marker
                                            key={`marker-${mapPosition.lat}-${mapPosition.lng}`}
                                            position={mapPosition}
                                            draggable
                                            onDragEnd={handleMarkerDrag}
                                        />
                                        <Circle
                                            key={`circle-${mapPosition.lat}-${mapPosition.lng}`}
                                            center={mapPosition}
                                            radius={mapRadius}
                                            options={{
                                                strokeColor: '#3388ff',
                                                strokeOpacity: 0.9,
                                                strokeWeight: 3,
                                                fillColor: '#3388ff',
                                                fillOpacity: 0.2,
                                            }}
                                        />
                                    </>
                                )}

                                {selectedInfoRegion &&
                                    selectedInfoRegion.latitude &&
                                    selectedInfoRegion.longitude && (
                                        <InfoWindow
                                            position={{
                                                lat: parseFloat(selectedInfoRegion.latitude),
                                                lng: parseFloat(selectedInfoRegion.longitude),
                                            }}
                                            onCloseClick={() => setSelectedInfoRegion(null)}
                                        >
                                            <div style={{ padding: '5px', maxWidth: '220px' }}>
                                                <strong>{selectedInfoRegion.placeName || 'Region'}</strong>
                                                <br />
                                                <small>
                                                    Lat: {parseFloat(selectedInfoRegion.latitude).toFixed(6)}, Lng:{' '}
                                                    {parseFloat(selectedInfoRegion.longitude).toFixed(6)}
                                                    <br />
                                                    Radius: {selectedInfoRegion.radius}m
                                                    <br />
                                                    <span style={{ color: '#3388ff', fontSize: '11px' }}>
                                                        Loaded into the form — adjust fields on the right if needed.
                                                    </span>
                                                </small>
                                            </div>
                                        </InfoWindow>
                                    )}
                            </GoogleMap>
                        )}
                    </div>
                </Col>

                {/* Form Fields Column - 4 columns */}
                <Col sm={4} className='pl0 '>
                    <div className='box-design d-flex flex-column no-box-shadow h-100'>
                        <div className="form-group d-flex justify-content-end mb0">
                            <RSTooltip text={UPLOAD_REGION_FILE} position="left" className="d-flex">
                                <i
                                    className={`${builder_upload_large} icon-lg color-primary-blue cursor-pointer`}
                                    onClick={() => setShowUploadModal(true)}
                                    id="rs_region_upload"
                                />
                            </RSTooltip>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={12}>
                                    <div className="position-relative">
                                        <RSInput
                                            name={'placeName'}
                                            control={control}
                                            placeholder={'Place name — type to search (Google, then OpenStreetMap)'}
                                            label={'Place name'}
                                            required
                                            maxLength={MAX_LENGTH50}
                                            rules={{ required: 'Enter place name' }}
                                            handleOnchange={onPlaceNameInputChange}
                                            handleOnFocus={() =>
                                                placeSuggestions.length > 0 && setPlaceSuggestionsOpen(true)
                                            }
                                            handleOnBlur={() =>
                                                setTimeout(() => setPlaceSuggestionsOpen(false), 200)
                                            }
                                        />
                                        {placeSuggestionsOpen && placeSuggestions.length > 0 && (
                                            <ul
                                                className="list-group"
                                                style={{
                                                    position: 'absolute',
                                                    zIndex: 20,
                                                    width: '100%',
                                                    maxHeight: '220px',
                                                    overflowY: 'auto',
                                                    marginTop: 2,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    borderRadius: 4,
                                                }}
                                            >
                                                {placeSuggestions.map((item, idx) => (
                                                    <li
                                                        key={
                                                            item.isNominatim
                                                                ? `nom-${item.lat}-${item.lng}-${idx}`
                                                                : `${item.placeId || 'g'}-${idx}`
                                                        }
                                                        className="list-group-item list-group-item-action"
                                                        style={{ cursor: 'pointer', fontSize: '13px' }}
                                                        onMouseDown={(ev) => {
                                                            ev.preventDefault();
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
                                </Col>
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={12}>
                                    <RSInput
                                        name={'latitude'}
                                        control={control}
                                        placeholder={'Latitude'}
                                        label={'Latitude'}
                                        required
                                        rules={{
                                            required: 'Enter latitude',
                                            pattern: {
                                                value: /^-?\d+(\.\d{1,20})?$/,
                                                message: 'Latitude must be a valid number with up to 20 decimal places'
                                            },
                                            validate: (v) => {
                                                const num = parseFloat(v);
                                                if (isNaN(num)) return 'Enter valid latitude';
                                                if (num < -90 || num > 90) return 'Latitude must be between -90 and 90';
                                                const decimalPart = v.split('.')[1];
                                                if (decimalPart && decimalPart.length > 20) {
                                                    return 'Latitude can have maximum 20 decimal places';
                                                }
                                                return true;
                                            },
                                        }}
                                        maxLength={30}
                                        onKeyDown={(e) => {
                                            // Allow paste operations (Ctrl+V, Cmd+V)
                                            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                                                return;
                                            }

                                            const allowKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
                                            if (allowKeys.includes(e.key)) return;

                                            const value = e.currentTarget.value;
                                            const cursorPos = e.currentTarget.selectionStart;

                                            if (e.key === '-') {
                                                if (cursorPos !== 0 || value.includes('-')) {
                                                    e.preventDefault();
                                                }
                                                return;
                                            }

                                            if (e.key === '.') {
                                                if (value.includes('.') || cursorPos === 0 || (cursorPos === 1 && value.startsWith('-'))) {
                                                    e.preventDefault();
                                                }
                                                return;
                                            }

                                            if (/[0-9]/.test(e.key)) {
                                                if (value.includes('.')) {
                                                    const decimalIndex = value.indexOf('.');
                                                    const decimalPart = value.substring(decimalIndex + 1);
                                                    if (cursorPos > decimalIndex && decimalPart.length >= 20) {
                                                        e.preventDefault();
                                                    }
                                                }
                                                return;
                                            }

                                            e.preventDefault();
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedText = (e.clipboardData || window.clipboardData).getData('text');

                                            // Clean the pasted text - remove any non-numeric characters except decimal point and minus
                                            let cleanedText = pastedText.replace(/[^\d.\-]/g, '');

                                            // Ensure only one minus sign at the start
                                            if (cleanedText.includes('-')) {
                                                const minusIndex = cleanedText.indexOf('-');
                                                if (minusIndex !== 0) {
                                                    cleanedText = cleanedText.replace(/-/g, '');
                                                } else {
                                                    cleanedText = '-' + cleanedText.replace(/-/g, '');
                                                }
                                            }

                                            // Ensure only one decimal point
                                            const decimalIndex = cleanedText.indexOf('.');
                                            if (decimalIndex !== -1) {
                                                cleanedText = cleanedText.substring(0, decimalIndex + 1) + cleanedText.substring(decimalIndex + 1).replace(/\./g, '');
                                            }

                                            // Limit decimal places to 20
                                            if (cleanedText.includes('.')) {
                                                const parts = cleanedText.split('.');
                                                if (parts[1] && parts[1].length > 20) {
                                                    cleanedText = parts[0] + '.' + parts[1].substring(0, 20);
                                                }
                                            }

                                            // Validate range
                                            const num = parseFloat(cleanedText);
                                            if (!isNaN(num)) {
                                                if (num >= -90 && num <= 90) {
                                                    setValue('latitude', cleanedText);
                                                }
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <div className="form-group">
                            <Row>
                                <Col sm={12}>
                                    <RSInput
                                        name={'longitude'}
                                        control={control}
                                        placeholder={'Longitude'}
                                        label={'Longitude'}
                                        required
                                        rules={{
                                            required: 'Enter longitude',
                                            pattern: {
                                                value: /^-?\d+(\.\d{1,20})?$/,
                                                message: 'Longitude must be a valid number with up to 20 decimal places'
                                            },
                                            validate: (v) => {
                                                const num = parseFloat(v);
                                                if (isNaN(num)) return 'Enter valid longitude';
                                                if (num < -180 || num > 180) return 'Longitude must be between -180 and 180';
                                                const decimalPart = v.split('.')[1];
                                                if (decimalPart && decimalPart.length > 20) {
                                                    return 'Longitude can have maximum 20 decimal places';
                                                }
                                                return true;
                                            },
                                        }}
                                        maxLength={30}
                                        onKeyDown={(e) => {
                                            // Allow paste operations (Ctrl+V, Cmd+V)
                                            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                                                return;
                                            }

                                            const allowKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
                                            if (allowKeys.includes(e.key)) return;

                                            const value = e.currentTarget.value;
                                            const cursorPos = e.currentTarget.selectionStart;

                                            if (e.key === '-') {
                                                if (cursorPos !== 0 || value.includes('-')) {
                                                    e.preventDefault();
                                                }
                                                return;
                                            }

                                            if (e.key === '.') {
                                                if (value.includes('.') || cursorPos === 0 || (cursorPos === 1 && value.startsWith('-'))) {
                                                    e.preventDefault();
                                                }
                                                return;
                                            }

                                            if (/[0-9]/.test(e.key)) {
                                                if (value.includes('.')) {
                                                    const decimalIndex = value.indexOf('.');
                                                    const decimalPart = value.substring(decimalIndex + 1);
                                                    if (cursorPos > decimalIndex && decimalPart.length >= 20) {
                                                        e.preventDefault();
                                                    }
                                                }
                                                return;
                                            }

                                            e.preventDefault();
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedText = (e.clipboardData || window.clipboardData).getData('text');

                                            // Clean the pasted text - remove any non-numeric characters except decimal point and minus
                                            let cleanedText = pastedText.replace(/[^\d.\-]/g, '');

                                            // Ensure only one minus sign at the start
                                            if (cleanedText.includes('-')) {
                                                const minusIndex = cleanedText.indexOf('-');
                                                if (minusIndex !== 0) {
                                                    cleanedText = cleanedText.replace(/-/g, '');
                                                } else {
                                                    cleanedText = '-' + cleanedText.replace(/-/g, '');
                                                }
                                            }

                                            // Ensure only one decimal point
                                            const decimalIndex = cleanedText.indexOf('.');
                                            if (decimalIndex !== -1) {
                                                cleanedText = cleanedText.substring(0, decimalIndex + 1) + cleanedText.substring(decimalIndex + 1).replace(/\./g, '');
                                            }

                                            // Limit decimal places to 20
                                            if (cleanedText.includes('.')) {
                                                const parts = cleanedText.split('.');
                                                if (parts[1] && parts[1].length > 20) {
                                                    cleanedText = parts[0] + '.' + parts[1].substring(0, 20);
                                                }
                                            }

                                            // Validate range
                                            const num = parseFloat(cleanedText);
                                            if (!isNaN(num)) {
                                                if (num >= -180 && num <= 180) {
                                                    setValue('longitude', cleanedText);
                                                }
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <div className="form-group">
                            <Row>
                                <Col sm={12}>
                                    <RSInput
                                        name={'radius'}
                                        control={control}
                                        placeholder={'Radius'}
                                        label={'Radius (m)'}
                                        required
                                        maxLength={4}
                                        rules={{
                                            required: 'Enter radius',
                                            pattern: { value: /^\d+(?:\.\d+)?$/, message: 'Enter valid radius' },
                                            validate: (v) => {
                                                const num = parseFloat(v);
                                                if (isNaN(num)) return 'Enter valid radius';
                                                if (num < 200) return 'Radius must be greater than 200 meters';
                                                if (num > 1000) return 'Radius must not exceed 1000 meters';
                                                return true;
                                            },
                                        }}
                                        onKeyDown={(e) => {
                                            // Allow paste operations (Ctrl+V, Cmd+V)
                                            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                                                return;
                                            }

                                            const allowed = /[0-9\.]/;
                                            if (e.key.length === 1 && !allowed.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedText = (e.clipboardData || window.clipboardData).getData('text');

                                            // Clean the pasted text - remove any non-numeric characters except decimal point
                                            let cleanedText = pastedText.replace(/[^\d.]/g, '');

                                            // Ensure only one decimal point
                                            const decimalIndex = cleanedText.indexOf('.');
                                            if (decimalIndex !== -1) {
                                                cleanedText = cleanedText.substring(0, decimalIndex + 1) + cleanedText.substring(decimalIndex + 1).replace(/\./g, '');
                                            }

                                            // Validate range
                                            const num = parseFloat(cleanedText);
                                            if (!isNaN(num) && num > 200 && num < 1000) {
                                                setValue('radius', cleanedText);
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <div className="form-group d-none">
                            <Row>
                                <Col sm={12}>
                                    <div className="d-flex align-items-center">
                                        <label className="control-label-left mr20">Custom data</label>
                                        <RSSwitch
                                            name="customDataEnabled" control={control}
                                            defaultValue={false}
                                            onLabel="ON"
                                            offLabel="OFF"
                                            handleChange={() => {
                                                setUserCustomAttributeTags([]);
                                                nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
                                                setValue('customData', [{ key: '', value: '', isDropdown: true }]);
                                            }}
                                        />
                                        <RSTooltip position="top" text={'Use custom data for advanced targeting and add up to 5 custom tags per region'} className="lh0 ml10">
                                            <i className={`${circle_question_mark_mini} icon-xs color-primary-blue`} />
                                        </RSTooltip>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {customDataEnabled && (
                            <div className="form-group mb0">
                                {fields.map((field, index) => {
                                    const rowKeyForValue = customDataRowsWatch?.[index]?.key;
                                    const rowKeyId = rowKeyForValue?.id;
                                    const lockBuiltinCustomValue =
                                        field?.isDropdown !== false && isBuiltinGeofenceTagId(rowKeyId);

                                    return (
                                    <>
                                        <div className="form-group">

                                            <Row key={field.id}>
                                                <Col sm={12} className="form-group">
                                                    {field?.isDropdown === false ? (
                                                        <div className="position-relative">
                                                            <RSInput
                                                                name={`customData[${index}].key`}
                                                                control={control}
                                                                placeholder={'Attribute name'}
                                                                required
                                                                isKeyDownUpPrevent={false}
                                                                rules={{
                                                                    required: 'Enter attribute name',
                                                                    validate: (value) => {
                                                                        if (!value || !value.trim()) {
                                                                            return 'Enter attribute name';
                                                                        }

                                                                        // Get current form values to check for duplicates
                                                                        const currentValues = getValues('customData');
                                                                        if (!Array.isArray(currentValues)) return true;

                                                                        const currentKey = value.trim();

                                                                        // Check for duplicates in other rows (same attribute name)
                                                                        const duplicates = currentValues.filter((item, idx) => {
                                                                            if (idx === index || !item.key) return false;

                                                                            const itemKey = typeof item.key === 'string'
                                                                                ? item.key.trim()
                                                                                : (item.isDropdown && item.key?.value ? item.key.value.trim() : '');

                                                                            return itemKey === currentKey;
                                                                        });

                                                                        if (duplicates.length > 0) {
                                                                            return ' Name already exists.';
                                                                        }

                                                                        // Trigger validation on value field to check for duplicates when key changes
                                                                        setTimeout(() => {
                                                                            const currentValue = watch(`customData[${index}].value`);
                                                                            if (currentValue) {
                                                                                setValue(`customData[${index}].value`, currentValue, { shouldValidate: true });
                                                                            }
                                                                        }, 100);

                                                                        return true;
                                                                    }
                                                                }}
                                                                className='pr20'
                                                                handleOnBlur={(e) => {
                                                                    // Trigger validation on value field to check for duplicates when key changes
                                                                    const currentValue = watch(`customData[${index}].value`);
                                                                    if (currentValue) {
                                                                        setTimeout(() => {
                                                                            setValue(`customData[${index}].value`, currentValue, { shouldValidate: true });
                                                                        }, 100);
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        commitCustomAttributeName(index);
                                                                    }
                                                                    if (e.key === 'Escape') {
                                                                        e.preventDefault();
                                                                        clearFormErrors(`customData[${index}].key`);
                                                                        const updatedField = {
                                                                            ...fields[index],
                                                                            isDropdown: true,
                                                                            key: '',
                                                                            value: '',
                                                                            id: null,
                                                                        };
                                                                        update(index, updatedField);
                                                                        setValue(`customData[${index}].key`, '');
                                                                        setValue(`customData[${index}].value`, '');
                                                                    }
                                                                }}
                                                            />
                                                            <span
                                                                className="position-absolute top7 right0 d-inline-flex align-items-center"
                                                                style={{ zIndex: 10 }}
                                                            >
                                                                <RSTooltip
                                                                    position="top"
                                                                    text={'Close'}
                                                                    className="lh0"
                                                                    trigger={['hover', 'focus']}
                                                                >
                                                                    <i
                                                                        role="button"
                                                                        tabIndex={0}
                                                                        className={`${close_mini} icon-sm color-primary-red cursor-pointer`}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            const updatedField = {
                                                                                ...fields[index],
                                                                                isDropdown: true,
                                                                                key: '',
                                                                                value: '',
                                                                                id: null,
                                                                            };
                                                                            update(index, updatedField);
                                                                            clearFormErrors(`customData[${index}].key`);
                                                                            setValue(`customData[${index}].key`, '');
                                                                            setValue(`customData[${index}].value`, '');
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                                e.preventDefault();
                                                                                e.currentTarget.click();
                                                                            }
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <RSKendoDropDownList
                                                            name={`customData[${index}].key`}
                                                            label={'Select attribute'}
                                                            control={control}
                                                            optionLabel={'Add attributes'}
                                                            data={getFilteredTags(index)}
                                                            filterName={ATTRIBUTE_DROPDOWN_ORDER_FIELD}
                                                            order="asc"
                                                            required
                                                            textField={'value'}
                                                            dataItemKey={'id'}
                                                            rules={{
                                                                required: 'Select attribute',
                                                                validate: (value) => {
                                                                    if (!value || value.id === null || value.id === undefined) {
                                                                        return 'Select attribute';
                                                                    }

                                                                    // Skip validation for "Add new attribute" option
                                                                    if (value.id === GEOFENCE_CUSTOM_DROPDOWN_OPTION.id) {
                                                                        return true;
                                                                    }

                                                                    // Get current form values to check for duplicates
                                                                    const currentValues = getValues('customData');
                                                                    if (!Array.isArray(currentValues)) return true;

                                                                    const currentKey = value.value ? value.value.trim() : '';
                                                                    if (!currentKey) return true;

                                                                    // Check for duplicates in other rows (same attribute name)
                                                                    const duplicates = currentValues.filter((item, idx) => {
                                                                        if (idx === index || !item.key) return false;

                                                                        const itemKey = item.isDropdown && item.key?.value
                                                                            ? item.key.value.trim()
                                                                            : (typeof item.key === 'string' ? item.key.trim() : '');

                                                                        return itemKey === currentKey;
                                                                    });

                                                                    if (duplicates.length > 0) {
                                                                        return ' Name already exists.';
                                                                    }

                                                                    // Trigger validation on value field to check for duplicates
                                                                    setTimeout(() => {
                                                                        const currentValue = watch(`customData[${index}].value`);
                                                                        if (currentValue) {
                                                                            setValue(`customData[${index}].value`, currentValue, { shouldValidate: true });
                                                                        }
                                                                    }, 100);

                                                                    return true;
                                                                }
                                                            }}
                                                            handleChange={(e) => {
                                                                const value = e?.target?.value;
                                                                const isCustomOption = value?.id === GEOFENCE_CUSTOM_DROPDOWN_OPTION.id;
                                                                const isUserDefinedTag =
                                                                    !isCustomOption &&
                                                                    value?.id >= USER_CUSTOM_TAG_ID_START;
                                                                const nextRowValue = isCustomOption
                                                                    ? ''
                                                                    : isUserDefinedTag
                                                                        ? (value?.value ?? '')
                                                                        : `[[${value?.value}]]`;
                                                                const keyForRow = isCustomOption
                                                                    ? ''
                                                                    : value && typeof value === 'object'
                                                                        ? {
                                                                            id: value.id,
                                                                            value: value.value,
                                                                        }
                                                                        : value;
                                                                const updatedField = {
                                                                    ...fields[index],
                                                                    id: value?.id,
                                                                    key: keyForRow,
                                                                    isDropdown: !isCustomOption,
                                                                    value: nextRowValue,
                                                                };
                                                                update(index, updatedField);
                                                                setValue(`customData[${index}].value`, nextRowValue, { shouldValidate: true });
                                                                setTimeout(() => {
                                                                    trigger(`customData[${index}].value`);
                                                                }, 0);
                                                            }}
                                                        />
                                                    )}
                                                </Col>
                                                <Col sm={11} >
                                                    <RSInput
                                                        className={lockBuiltinCustomValue ? 'click-off' : ''}
                                                        name={`customData[${index}].value`}
                                                        control={control}
                                                        placeholder={'Custom value'}
                                                        required
                                                        maxLength={MAX_LENGTH50}
                                                        rules={{
                                                            required: 'Enter custom value',
                                                            validate: (value) => {
                                                                if (!value || !value.trim()) {
                                                                    return 'Enter custom value';
                                                                }

                                                                // Get current form values to check for duplicates
                                                                const currentValues = getValues('customData');
                                                                if (!Array.isArray(currentValues)) return true;

                                                                const currentItem = currentValues[index];
                                                                if (!currentItem || !currentItem.key) return true;

                                                                const currentEventName = currentItem.isDropdown && currentItem.key?.value
                                                                    ? currentItem.key.value
                                                                    : (typeof currentItem.key === 'string' ? currentItem.key : '');
                                                                const currentEventValue = value.trim();

                                                                // Check for duplicates in other rows (same attribute + same value)
                                                                const duplicates = currentValues.filter((item, idx) => {
                                                                    if (idx === index || !item.key || !item.value) return false;

                                                                    const itemEventName = item.isDropdown && item.key?.value
                                                                        ? item.key.value
                                                                        : (typeof item.key === 'string' ? item.key : '');
                                                                    const itemEventValue = typeof item.value === 'string' ? item.value.trim() : String(item.value || '').trim();

                                                                    return itemEventName === currentEventName &&
                                                                        itemEventValue === currentEventValue;
                                                                });

                                                                if (duplicates.length > 0) {
                                                                    return 'Value already exists.';
                                                                }

                                                                return true;
                                                            }
                                                        }}
                                                        handleOnBlur={() => {
                                                            if (fields[index]?.isDropdown === false) return;
                                                            const keyVal = getValues(`customData[${index}].key`);
                                                            const kid = keyVal?.id;
                                                            if (!isBuiltinGeofenceTagId(kid)) return;
                                                            const updatedField = {
                                                                ...fields[index],
                                                                isDropdown: false,
                                                            };
                                                            update(index, updatedField);
                                                        }}
                                                    />
                                                </Col>
                                                <Col sm={1} className='pl0 lh0 position-relative right7'>
                                                    {index === 0 ? (
                                                        <RSTooltip position="top" text={'Add'} className="d-inline-block position-relative top3">
                                                            <div className={`${fields.length < MAX_CUSTOM_DATA ? '' : 'pe-none click-off'}`} >
                                                                <i
                                                                    className={`icon-md color-primary-blue ${circle_plus_fill_edge_medium}`}
                                                                    onClick={() => {
                                                                        handleAddRow();
                                                                    }}
                                                                />
                                                            </div>
                                                        </RSTooltip>
                                                    ) : index > 0 ? (
                                                        <RSTooltip position="top" text={'Remove'} className="d-inline-block position-relative top3">
                                                            <i
                                                                className={`icon-md color-primary-red ${circle_minus_fill_edge_medium}`}
                                                                onClick={() => {
                                                                    let temp = [...fields];
                                                                    temp.splice(index, 1);
                                                                    setValue('customData', temp);
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    ) : null}
                                                </Col>
                                            </Row>
                                        </div>
                                    </>
                                    );
                                })}
                            </div>
                        )}
                        <div className="form-group justify-content-end d-flex mb0 mt-auto">
                            <>
                                <RSSecondaryButton
                                    onClick={() => {
                                        setSuccessMessage('');
                                        setErrorMessage('');
                                        setLocalEditIndex(null); // Clear local edit index on close
                                        setIsEditMode(false); // Reset edit mode
                                        handleClose(false);
                                    }}
                                    disabled={isSubmitting}
                                    className='mr15'
                                >
                                    Cancel
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Validating...' : (isEditMode ? 'Update' : 'Add')}
                                </RSPrimaryButton>
                            </>
                        </div>
                    </div>
                </Col>
            </Row>
        );
    };

    // Render Map Tab Content
    const renderMapTab = () => (
        <div className="map-tab-content">
            <p className="text-muted mb15">
                Use the map below to draw and select your region. Click on the map tools to draw circles, rectangles, polygons, or place markers.
            </p>
            {/* MapModal will be rendered separately as it's a modal component */}
        </div>
    );

    const handleAddRow = () => {
        if (fields.length >= MAX_CUSTOM_DATA) return;
        append({ key: '', value: '', isDropdown: true });
    };

    const handleOpenMapPicker = () => {
        // Capture current form values before opening map
        const currentValues = {
            lat: watch('latitude'),
            lng: watch('longitude'),
            radius: watch('radius'),
            placeName: watch('placeName'),
        };

        // Only pass initial position if lat and lng are valid
        if (currentValues.lat && currentValues.lng) {
            setMapInitialPosition(currentValues);
        } else {
            setMapInitialPosition(null);
        }

        setShowMapPicker(true);
    };

    const handleLocationPick = (locationData) => {
        // Update form values with the picked location
        setValue('placeName', locationData.placeName);
        setValue('latitude', locationData.latitude);
        setValue('longitude', locationData.longitude);
        setValue('radius', locationData.radius);
        setShowMapPicker(false);
    };

    // Handle existing region marker click to populate form fields and set edit mode
    const handleExistingRegionClick = (region) => {
        const lat = parseFloat(region.latitude);
        const lng = parseFloat(region.longitude);
        const radius = parseFloat(region.radius) || 100;

        // Find the index of this region in existingRegions array
        const regionIndex = existingRegions.findIndex(
            (r) =>
                r.placeName === region.placeName &&
                r.latitude === region.latitude &&
                r.longitude === region.longitude &&
                r.radius === region.radius
        );

        // Set map position and center
        setMapPosition({ lat, lng });
        setMapCenter({ lat, lng });
        setMapRadius(radius);
        setShouldFitBounds(false);

        // Populate form fields
        setValue('placeName', region.placeName || '');
        setValue('latitude', lat.toFixed(20));
        setValue('longitude', lng.toFixed(20));
        setValue('radius', radius.toString());

        // Handle custom data if available
        if (region.jsonData && Array.isArray(region.jsonData) && region.jsonData.length > 0) {
            const hasCustomData = region.jsonData.some(item => item.eventName && item.eventValue);
            setValue('customDataEnabled', hasCustomData);

            if (hasCustomData) {
                // Map jsonData to customData format
                const customDataMapped = region.jsonData.map((item) => {
                    // Check if eventName matches predefined tags
                    const predefinedTags = getGeofenceTagsForMatching();
                    const matchingTag = predefinedTags.find((tag) => tag.value === item.eventName);

                    if (matchingTag && matchingTag.id !== GEOFENCE_CUSTOM_DROPDOWN_OPTION.id) {
                        // It's a predefined tag
                        return {
                            key: matchingTag,
                            value: item.eventValue || '',
                            isDropdown: true,
                        };
                    } else {
                        // It's a custom tag
                        return {
                            key: item.eventName || '',
                            value: item.eventValue || '',
                            isDropdown: false,
                        };
                    }
                });
                nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
                const { normalized: normalizedCustom, newUserTags } = normalizeLoadedCustomDataRows(
                    customDataMapped,
                    nextUserCustomTagIdRef,
                );
                setUserCustomAttributeTags(newUserTags);
                setValue('customData', normalizedCustom);
            } else {
                nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
                setUserCustomAttributeTags([]);
                setValue('customData', [{ key: '', value: '', isDropdown: true }]);
            }
        } else {
            setValue('customDataEnabled', false);
            nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
            setUserCustomAttributeTags([]);
            setValue('customData', [{ key: '', value: '', isDropdown: true }]);
        }

        // Set edit mode if region index is found
        if (regionIndex !== -1) {
            // Store edit index locally for form submission
            setLocalEditIndex(regionIndex);

            // Notify parent to set edit mode
            if (onEdit) {
                onEdit(regionIndex);
            }

            // Set edit mode locally
            setIsEditMode(true);
        }
    };

    // Handle marker drag to update location (Google Maps)
    const handleMarkerDrag = async (e) => {
        if (!e.latLng) return;
        const newPosition = normalizeLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        if (!newPosition) return;
        const lat = newPosition.lat;
        const lng = newPosition.lng;

        const newMapPosition = { lat, lng };
        setMapPosition(newMapPosition);
        setMapCenter({ lat, lng });
        setShouldFitBounds(false);

        setValue('latitude', lat.toFixed(20), { shouldValidate: true, shouldDirty: true });
        setValue('longitude', lng.toFixed(20), { shouldValidate: true, shouldDirty: true });
        setValue('placeName', `Location: ${lat.toFixed(20)}, ${lng.toFixed(20)}`, { shouldValidate: true, shouldDirty: true });

        setLocalEditIndex(null);
        setIsEditMode(false);
        if (onEdit) {
            onEdit(null);
        }

        try {
            const geo = await reverseGeocodeLatLng(lat, lng);
            const pn = pickDisplayPlaceName(geo, lat, lng, 12).slice(0, MAX_LENGTH50);
            setValue('placeName', pn, { shouldValidate: true, shouldDirty: true });
        } catch {
            setValue(
                'placeName',
                pickDisplayPlaceName(null, lat, lng, 12).slice(0, MAX_LENGTH50),
                { shouldValidate: true, shouldDirty: true }
            );
        }
    };

    // Handle map click to select location
    const handleMapLocationSelect = async (latlng) => {
        const normalizedLatLng = normalizeLatLng(latlng);
        if (!normalizedLatLng) return;

        setMapPosition(normalizedLatLng);

        setMapCenter({ lat: normalizedLatLng.lat, lng: normalizedLatLng.lng });
        setShouldFitBounds(false);

        setLocalEditIndex(null);
        setIsEditMode(false);
        if (onEdit) {
            onEdit(null);
        }

        const currentRadius = getValues('radius');
        if (!currentRadius || currentRadius === '') {
            setValue('radius', '100');
            setMapRadius(100);
        } else {
            setMapRadius(parseFloat(currentRadius) || 100);
        }

        setValue('latitude', normalizedLatLng.lat.toFixed(20), { shouldValidate: true, shouldDirty: true });
        setValue('longitude', normalizedLatLng.lng.toFixed(20), { shouldValidate: true, shouldDirty: true });

        try {
            const geo = await reverseGeocodeLatLng(normalizedLatLng.lat, normalizedLatLng.lng);
            const pn = pickDisplayPlaceName(geo, normalizedLatLng.lat, normalizedLatLng.lng, 12).slice(
                0,
                MAX_LENGTH50
            );
            setValue('placeName', pn, { shouldValidate: true, shouldDirty: true });
        } catch {
            setValue(
                'placeName',
                pickDisplayPlaceName(null, normalizedLatLng.lat, normalizedLatLng.lng, 12).slice(
                    0,
                    MAX_LENGTH50
                ),
                { shouldValidate: true, shouldDirty: true }
            );
        }
    };

    const handleMapLocationSelectRef = useRef(null);
    handleMapLocationSelectRef.current = handleMapLocationSelect;

    // Center map only when adding first region — no automatic pin or form fill.
    useEffect(() => {
        if (!show || !isGoogleMapLoaded) return;
        if (initialValues?.latitude && initialValues?.longitude) return;
        if (Array.isArray(existingRegions) && existingRegions.length > 0) return;

        let cancelled = false;
        resolveDefaultMapCenter().then((c) => {
            if (!cancelled) setMapCenter(c);
        });
        return () => {
            cancelled = true;
        };
    }, [
        show,
        isGoogleMapLoaded,
        initialValues?.latitude,
        initialValues?.longitude,
        existingRegions.length,
    ]);

    // Native map click listener — reliable inside modals; React onClick on GoogleMap can fail to bind correctly.
    useEffect(() => {
        if (!show || !mapInstance || !window.google?.maps?.event) return;
        const listener = mapInstance.addListener('click', (ev) => {
            if (!ev.latLng) return;
            const normalized = normalizeLatLng({
                lat: ev.latLng.lat(),
                lng: ev.latLng.lng(),
            });
            if (normalized) {
                const fn = handleMapLocationSelectRef.current;
                if (typeof fn === 'function') fn(normalized);
            }
        });
        return () => {
            window.google.maps.event.removeListener(listener);
        };
    }, [show, mapInstance]);

    const onSubmit = async (data) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        clearFormErrors();

        try {
            // Validate parent form fields
            // if (!clusterName || !clusterName.trim()) {
            //     setErrorMessage('Please enter cluster name in the main form before adding regions.');
            //     setIsSubmitting(false);
            //     return;
            // }

            // if (!mobileApp || !mobileApp.appGuid) {
            //     setErrorMessage('Please select a mobile app in the main form before adding regions.');
            //     setIsSubmitting(false);
            //     return;
            // }

            // // Validate date range for custom period
            // if (!dateInfo.isAllTime && (!dateInfo.startDate || !dateInfo.endDate)) {
            //     setErrorMessage('Please select start and end dates in the main form for custom period.');
            //     setIsSubmitting(false);
            //     return;
            // }

            // Validate custom data for duplicates
            if (data.customDataEnabled && Array.isArray(data.customData)) {
                const validCustomData = data.customData.filter(item => item.key && item.value);

                // Check for duplicate attribute names (keys)
                const attributeNameMap = new Map();
                const duplicateAttributes = [];

                for (let i = 0; i < validCustomData.length; i++) {
                    const item = validCustomData[i];
                    const attributeName = item.isDropdown && item.key?.value
                        ? item.key.value.trim()
                        : (typeof item.key === 'string' ? item.key.trim() : '');

                    if (attributeName) {
                        const key = attributeName.toLowerCase();
                        if (attributeNameMap.has(key)) {
                            duplicateAttributes.push({
                                index: i + 1,
                                attributeName: attributeName
                            });
                        } else {
                            attributeNameMap.set(key, true);
                        }
                    }
                }

                if (duplicateAttributes.length > 0) {
                    const duplicateMsg = duplicateAttributes.map(dup =>
                        `Row ${dup.index}: ${dup.attributeName}`
                    ).join(', ');
                    setErrorMessage(`Duplicate attribute names found: ${duplicateMsg}. Each attribute name must be unique.`);
                    setIsSubmitting(false);
                    setTimeout(() => setErrorMessage(''), 5000);
                    return;
                }

                // Check for duplicate custom tag values (same eventName + eventValue combination)
                const customDataMap = new Map();
                const duplicates = [];

                for (let i = 0; i < validCustomData.length; i++) {
                    const item = validCustomData[i];
                    const eventName = item.isDropdown && item.key?.value ? item.key.value : item.key;
                    const eventValue = item.value;
                    const key = `${eventName}_${eventValue}`.toLowerCase();

                    if (customDataMap.has(key)) {
                        duplicates.push({
                            index: i + 1,
                            eventName: eventName,
                            eventValue: eventValue
                        });
                    } else {
                        customDataMap.set(key, true);
                    }
                }

                if (duplicates.length > 0) {
                    const duplicateMsg = duplicates.map(dup =>
                        `Row ${dup.index}: ${dup.eventName} = ${dup.eventValue}`
                    ).join(', ');
                    setErrorMessage(`Duplicate custom tag values found: ${duplicateMsg}. Each custom tag value must be unique.`);
                    setIsSubmitting(false);
                    setTimeout(() => setErrorMessage(''), 5000);
                    return;
                }
            }

            // Build the new region object
            const newRegion = {
                regionId: initialValues?.regionId || undefined, // Preserve regionId when editing
                placeName: data.placeName,
                latitude: data.latitude?.toString(),
                longitude: data.longitude?.toString(),
                radiusType: '',
                radius: data.radius?.toString(),
                jsonData: data.customDataEnabled && Array.isArray(data.customData)
                    ? data.customData
                        .filter(item => item.key && item.value) // Filter out empty rows
                        .map((item) => ({
                            eventName: item.isDropdown && item.key?.value ? item.key.value : item.key,
                            eventValue: item.value,
                        }))
                    : [],
            };

            // Merge regions: replace if editing, add if new
            let allRegions = [...existingRegions];
            // Use localEditIndex if available (from grid edit), otherwise use editIndex prop
            const currentEditIndex = localEditIndex !== null && localEditIndex !== undefined ? localEditIndex : editIndex;

            // Check region limit when adding new region (not editing)
            if (!isEditMode || currentEditIndex === null || currentEditIndex === undefined) {
                const currentRegionCount = Array.isArray(existingRegions) ? existingRegions.length : 0;
                if (currentRegionCount >= MAX_REGIONS) {
                    setErrorMessage(`Maximum limit of ${MAX_REGIONS} regions reached. Cannot add more regions.`);
                    setIsSubmitting(false);
                    setTimeout(() => setErrorMessage(''), 5000);
                    return;
                }
            }

            if (isEditMode && currentEditIndex !== null && currentEditIndex !== undefined) {
                allRegions[currentEditIndex] = newRegion;
            } else {
                allRegions.push(newRegion);
            }

            // Build API payload
            const payload = {
                geoFenceId: geoFenceId || 0,
                Identifier: clusterName,
                startDate: dateInfo.startDate,
                endDate: dateInfo.endDate,
                isAllTime: dateInfo.isAllTime,
                appList: Array.isArray(mobileApp) && mobileApp.length > 0
                    ? mobileApp.map((app) => ({
                        appId: app.appGuid,
                        appName: app.appName,
                    }))
                    : [],
                cluster: allRegions,
            };

            // Call validation API
            const response = await dispatch(checkValidGeoFence(payload));

            if (response?.status) {
                // Validation successful - call parent onAdd
                // Include regionId in data when editing
                const regionData = {
                    ...data,
                    regionId: initialValues?.regionId || undefined,
                };
                onAdd(regionData);

                if (isEditMode) {
                    // Edit mode - show success message, reset form, keep modal open
                    setSuccessMessage('Region updated successfully');
                    setLocalEditIndex(null); // Clear local edit index
                    setIsEditMode(false); // Reset edit mode
                    if (onEdit) {
                        onEdit(null); // Notify parent to clear edit index
                    }
                    methods.reset(DEFAULT_VALUES); // Reset form to default values
                    setIsSubmitting(false);

                    // Clear map position to reset map state
                    setMapPosition(null);
                    setMapRadius(100);
                    setShouldFitBounds(true); // Re-fit bounds to show all regions

                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessage('');
                    }, 3000);
                } else {
                    // Add mode - show success message, reset form, keep modal open
                    setSuccessMessage('Region added successfully');
                    methods.reset(DEFAULT_VALUES);
                    setIsSubmitting(false);

                    // Clear map position to reset map state
                    setMapPosition(null);
                    setMapRadius(100);
                    setShouldFitBounds(true); // Re-fit bounds to show all regions

                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        setSuccessMessage('');
                    }, 3000);
                }
            } else {
                // Validation failed
                const errorMsg = response?.message || 'Validation failed. Please check your inputs.';
                setErrorMessage(errorMsg);
                setIsSubmitting(false);
            }
        } catch (err) {
            setErrorMessage('An error occurred while validating the region.');
            setIsSubmitting(false);
        }
    };

    // Handle download Excel/CSV
    const handleDownloadExcel = () => {
        if (!Array.isArray(existingRegions) || existingRegions.length === 0) {
            setErrorMessage('No regions available to download.');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        // Prepare data for CSV export
        const csvData = existingRegions.map((region, index) => {
            const jsonDataStr = region.jsonData && Array.isArray(region.jsonData) && region.jsonData.length > 0
                ? JSON.stringify(region.jsonData)
                : '';

            return {
                'Place Name': region.placeName || `Region ${index + 1}`,
                'Latitude': region.latitude || '',
                'Longitude': region.longitude || '',
                'Radius (m)': region.radius || '',
                'Custom Data (JSON)': jsonDataStr,
            };
        });

        // Generate filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
        const filename = `geofence_regions_${timestamp}.csv`;

        // Download CSV
        downloadCSV(csvData, filename);
        setSuccessMessage('Regions downloaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Handle upload success - append, validate, and render on map
    const handleUploadSuccess = async (uploadedRegions) => {
        if (!Array.isArray(uploadedRegions) || uploadedRegions.length === 0) {
            setErrorMessage('No regions were uploaded.');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Step 1: Check region limit before appending
            const currentRegionCount = Array.isArray(existingRegions) ? existingRegions.length : 0;
            const totalRegions = currentRegionCount + uploadedRegions.length;

            if (totalRegions > MAX_REGIONS) {
                const availableSlots = MAX_REGIONS - currentRegionCount;
                setErrorMessage(`Cannot upload ${uploadedRegions.length} regions. Maximum allowed is ${MAX_REGIONS} regions. You currently have ${currentRegionCount} region(s). You can only add ${availableSlots} more region(s).`);
                setIsSubmitting(false);
                setTimeout(() => setErrorMessage(''), 5000);
                return;
            }

            // Step 2: Append uploaded regions to existing regions
            const allRegions = [...(existingRegions || []), ...uploadedRegions];

            // Step 3: Validate all regions together (existing + uploaded)
            const payload = {
                geoFenceId: geoFenceId || 0,
                Identifier: clusterName,
                startDate: dateInfo.startDate,
                endDate: dateInfo.endDate,
                isAllTime: dateInfo.isAllTime,
                appList: mobileApp ? [{
                    appId: mobileApp.appGuid,
                    appName: mobileApp.appName,
                }] : [],
                cluster: allRegions.map((region) => ({
                    placeName: region.placeName,
                    latitude: region.latitude?.toString(),
                    longitude: region.longitude?.toString(),
                    radius: region.radius?.toString(),
                    jsonData: region.jsonData && Array.isArray(region.jsonData) && region.jsonData.length > 0
                        ? region.jsonData
                        : [],
                })),
            };

            // Call validation API for all regions
            const response = await dispatch(checkValidGeoFence(payload));

            if (response?.status) {
                // Step 3: Validation successful - add uploaded regions to parent
                // Add each uploaded region to parent state (which will update existingRegions prop)
                if (onAdd) {
                    uploadedRegions.forEach((region) => {
                        onAdd(region);
                    });
                }

                setShowUploadModal(false);
                setSuccessMessage(`${uploadedRegions.length} region(s) uploaded and validated successfully! All ${allRegions.length} regions are now displayed on the map.`);

                // Step 4: Map will automatically re-render because existingRegions prop will update
                // The mapBounds useMemo will recalculate with new existingRegions
                // Reset bounds to show all regions after a short delay to allow state update
                setTimeout(() => {
                    setShouldFitBounds(true);
                }, 200);

                setTimeout(() => {
                    setSuccessMessage('');
                    setIsSubmitting(false);
                }, 3000);
            } else {
                // Validation failed
                const errorMsg = response?.message || 'Validation failed. Please check your uploaded data.';
                setErrorMessage(errorMsg);
                setIsSubmitting(false);
                setTimeout(() => setErrorMessage(''), 5000);
            }
        } catch (err) {
            setErrorMessage('An error occurred while validating regions. Please try again.');
            setIsSubmitting(false);
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    // Handle upload validation error
    const handleUploadValidationError = (errorMsg) => {
        setErrorMessage(errorMsg || 'Failed to upload regions. Please check your file format.');
        setTimeout(() => setErrorMessage(''), 5000);
    };

    // Handle edit region from grid
    const handleEditGridRegion = (region, index) => {
        // Populate form with region data
        const lat = parseFloat(region.latitude);
        const lng = parseFloat(region.longitude);
        const radius = parseFloat(region.radius) || 100;

        // Set map position and center
        setMapPosition({ lat, lng });
        setMapCenter({ lat, lng });
        setMapRadius(radius);
        setShouldFitBounds(false);

        // Populate form fields
        setValue('placeName', region.placeName || '');
        setValue('latitude', lat.toFixed(20));
        setValue('longitude', lng.toFixed(20));
        setValue('radius', radius.toString());

        // Handle custom data if available
        if (region.jsonData && Array.isArray(region.jsonData) && region.jsonData.length > 0) {
            const hasCustomData = region.jsonData.some(item => item.eventName && item.eventValue);
            setValue('customDataEnabled', hasCustomData);

            if (hasCustomData) {
                // Map jsonData to customData format
                const customDataMapped = region.jsonData.map((item) => {
                    // Check if eventName matches predefined tags
                    const predefinedTags = getGeofenceTagsForMatching();
                    const matchingTag = predefinedTags.find((tag) => tag.value === item.eventName);

                    if (matchingTag && matchingTag.id !== GEOFENCE_CUSTOM_DROPDOWN_OPTION.id) {
                        // It's a predefined tag
                        return {
                            key: matchingTag,
                            value: item.eventValue || '',
                            isDropdown: true,
                        };
                    } else {
                        // It's a custom tag
                        return {
                            key: item.eventName || '',
                            value: item.eventValue || '',
                            isDropdown: false,
                        };
                    }
                });
                nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
                const { normalized: normalizedCustom, newUserTags } = normalizeLoadedCustomDataRows(
                    customDataMapped,
                    nextUserCustomTagIdRef,
                );
                setUserCustomAttributeTags(newUserTags);
                setValue('customData', normalizedCustom);
            } else {
                nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
                setUserCustomAttributeTags([]);
                setValue('customData', [{ key: '', value: '', isDropdown: true }]);
            }
        } else {
            setValue('customDataEnabled', false);
            nextUserCustomTagIdRef.current = USER_CUSTOM_TAG_ID_START;
            setUserCustomAttributeTags([]);
            setValue('customData', [{ key: '', value: '', isDropdown: true }]);
        }

        // Store edit index locally for form submission
        setLocalEditIndex(index);

        // Notify parent to set edit mode
        if (onEdit) {
            onEdit(index);
        }

        // Set edit mode locally
        setIsEditMode(true);
    };

    // Handle delete region from grid
    const handleDeleteGridRegion = (index) => {
        setDeleteRegionIndex(index);
        setShowDeleteModal(true);
    };

    // Confirm delete region
    const handleConfirmDelete = (status) => {
        if (status && deleteRegionIndex !== null && deleteRegionIndex !== undefined) {
            // Call parent's onDelete callback
            if (onDelete) {
                onDelete(deleteRegionIndex);
            }
            setSuccessMessage('Region deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        setDeleteRegionIndex(null);
        setShowDeleteModal(false);
    };

    // Header right content with download and upload icons
    const headerRightContent = (
        <div className="d-flex align-items-center" style={{ gap: '10px' }}>
            {/* <RSTooltip text="Download regions as Excel/CSV" position="left">
                <i
                    className={`${download_medium} icon-md color-primary-blue cursor-pointer`}
                    onClick={handleDownloadExcel}
                    id="rs_region_download"
                    style={{ padding: '5px' }}
                />
            </RSTooltip> */}
            <RSTooltip text="Upload regions from Excel/CSV" position="left">
                <i
                    className={`${builder_upload_medium} icon-md color-primary-blue cursor-pointer`}
                    onClick={() => setShowUploadModal(true)}
                    id="rs_region_upload"
                    style={{ padding: '5px' }}
                />
            </RSTooltip>
        </div>
    );

    // Tab data for RSTabbar
    const tabData = useMemo(() => [
        {
            id: 'manual',
            text: 'Manual',
            component: renderManualTab,
        },
        {
            id: 'map',
            text: 'Map',
            component: renderMapTab,
        },
    ], [customDataEnabled, fields]);

    return (
        <FormProvider {...methods}>
            <RSModal
                show={show}
                size="xxlg"
                header={isEditMode ? 'Update region' : 'Add new region'}
                settings={{ enforceFocus: false }}
                // headerRightContent={headerRightContent}
                handleClose={() => {
                    setSuccessMessage('');
                    setErrorMessage('');
                    setIsSubmitting(false);
                    handleClose(false);
                }}
                isCloseButton={true}
                bodyClassName='bg-tertiary-blue'
                body={
                    <div>
                        {/* Success Message Toast */}
                        {successMessage && (
                            <>
                                <div
                                    className="alert alert-success align-items-stretch border-r7 d-flex mb30"
                                >
                                    <i className={`${circle_tick_medium} icon-md bg-primary-green mr5 position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center`} />
                                    <span className='align-items-center d-flex py5'>{successMessage}</span>
                                </div>
                            </>

                        )}

                        {/* Error Message Toast */}
                        {errorMessage  && (

                            <div
                                className="alert alert-danger align-items-stretch border-r7 d-flex mb30"
                            >
                                <i className={`${alert_medium} icon-md bg-orange-medium mr5 position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center`} />
                                <span className='align-items-center d-flex py5'>{errorMessage}</span>
                                <RSTooltip text={'Close'} className="position-absolute right5  top5 lh0">
                                    <i
                                        className={`${circle_close_mini} icon-xs cursor-pointer color-orange-medium`}
                                        onClick={() => setErrorMessage('')}

                                    />
                                </RSTooltip>
                            </div>

                        )}

                        {/* RSTabbar Component */}
                        {/* <RSTabbar
                            className="rs-tabs row mb20"
                            defaultClass="col-md-6"
                            componentClassName="mt20"
                            defaultTab={activeTabIndex}
                            tabData={tabData}
                            callBack={(tab, index) => {
                                setActiveTabIndex(index);
                            }}
                        /> */}
                        {renderManualTab()}


                        {/* Regions Grid - Show only when existingRegions.length > 0 */}
                        {Array.isArray(existingRegions) && existingRegions.length > 0 && (
                            <div className="mt30">
                                <KendoGrid
                                    data={existingRegions}
                                    noBoxShadow
                                    settings={{
                                        total: existingRegions.length || 0,
                                    }}
                                    isFailure={!existingRegions.length}
                                    isCustomBox
                                    column={[
                                        {
                                            field: 'placeName',
                                            title: PLACE_NAME || 'Place name',
                                            filter: 'text',
                                            width: '250px',
                                            cell: ({ dataItem }) => (
                                                <td>
                                                    {/* {dataItem?.placeName?.length > 30 ? (
                                                        <RSTooltip text={dataItem?.placeName} position="top" className="d-inline-block">
                                                            <span className="m0">{truncateTitle(dataItem?.placeName, 30)}</span>
                                                        </RSTooltip>
                                                    ) : ( */}
                                                    <span className="m0">{dataItem?.placeName || 'NA'}</span>
                                                    {/* )} */}
                                                </td>
                                            ),
                                        },
                                        {
                                            field: 'latitude',
                                            title: LATITUDE || 'Latitude',
                                            width: '250px',
                                            filter: 'text',
                                            // cell: ({ dataItem }) => (
                                            //     <td>
                                            //         <span className="m0">{dataItem?.latitude || 'NA'}</span>
                                            //     </td>
                                            // ),
                                        },
                                        {
                                            field: 'longitude',
                                            title: LONGITUDE || 'Longitude',
                                            width: '250px',
                                            filter: 'text',
                                            // cell: ({ dataItem }) => (
                                            //     <td>
                                            //         <span className="m0">{dataItem?.longitude || 'NA'}</span>
                                            //     </td>
                                            // ),
                                        },
                                        {
                                            field: 'radius',
                                            title: RADIUS || 'Radius (m)',
                                            width: '160px',
                                            filter: 'text',
                                            // cell: ({ dataItem }) => (
                                            //     <td>
                                            //         <span className="m0">{dataItem?.radius || 'NA'}</span>
                                            //     </td>
                                            // ),
                                        },
                                        {
                                            field: 'action',
                                            title: ACTIONS || 'Actions',
                                            width: '150px',
                                            cell: ({ dataItem, dataIndex }) => {
                                                // Use dataIndex if available, otherwise find by matching properties
                                                let regionIndex = dataIndex;
                                                if (regionIndex === undefined || regionIndex === null) {
                                                    regionIndex = existingRegions.findIndex(
                                                        (r) =>
                                                            r.placeName === dataItem?.placeName &&
                                                            r.latitude === dataItem?.latitude &&
                                                            r.longitude === dataItem?.longitude &&
                                                            r.radius === dataItem?.radius
                                                    );
                                                }

                                                // Ensure we have a valid index
                                                if (regionIndex === -1 || regionIndex === undefined || regionIndex === null) {
                                                    return <td></td>;
                                                }

                                                return (
                                                    <td>
                                                        <ul className="rs-list-inline rli-space-10 lh0">
                                                            <li>
                                                                <RSTooltip text={EDIT || 'Edit'} position="top">
                                                                    <i
                                                                        onClick={() => handleEditGridRegion(dataItem, regionIndex)}
                                                                        className={`${pencil_edit_medium} icon-md color-primary-blue cursor-pointer`}
                                                                        id="rs_region_grid_edit"
                                                                    ></i>
                                                                </RSTooltip>
                                                            </li>
                                                            <li>
                                                                <RSTooltip text={DELETE || 'Delete'} position="top">
                                                                    <i
                                                                        onClick={() => handleDeleteGridRegion(regionIndex)}
                                                                        className={`${delete_medium} icon-md color-primary-red cursor-pointer`}
                                                                        id="rs_region_grid_delete"
                                                                    ></i>
                                                                </RSTooltip>
                                                            </li>
                                                        </ul>
                                                    </td>
                                                );
                                            },
                                        },
                                    ]}
                                />

                                {/* Confirm Button */}
                                <div className="buttons-holder mt30">
                                    <RSPrimaryButton
                                        onClick={() => {
                                            // Close modal and confirm regions
                                            handleClose(true);
                                        }}
                                        id="rs_region_confirm"
                                    >
                                        {CONFIRM || 'Confirm'}
                                    </RSPrimaryButton>
                                </div>
                            </div>
                        )}
                    </div>
                }
            />

            {/* Map Picker Modal */}
            <MapPicker
                show={showMapPicker}
                handleClose={() => setShowMapPicker(false)}
                onLocationPick={handleLocationPick}
                initialPosition={mapInitialPosition}
            />

            {/* Map Modal - Google Maps with Drawing Tools */}
            {showMapModal && (
                <MapModal
                    show={showMapModal}
                    handleClose={() => {
                        setShowMapModal(false);
                        setActiveTabIndex(0);
                    }}
                    name="geofenceRegion"
                />
            )}

            {/* Region Upload Modal */}
            <RegionUpload
                show={showUploadModal}
                handleClose={() => setShowUploadModal(false)}
                onUpload={handleUploadSuccess}
                onValidationError={handleUploadValidationError}
                geoFenceId={geoFenceId}
                clusterName={clusterName}
                dateInfo={dateInfo}
                mobileApp={mobileApp}
                existingRegions={existingRegions}
            />

            {/* Delete Confirmation Modal */}
            <RSConfirmationModal
                show={showDeleteModal}
                text="Are you sure you want to delete this region?"
                handleClose={() => {
                    setDeleteRegionIndex(null);
                    setShowDeleteModal(false);
                }}
                handleConfirm={handleConfirmDelete}
            />
        </FormProvider>
    );
};

export default AddRegion;
