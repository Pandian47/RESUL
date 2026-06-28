import { info_mini, map_marker_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, Marker, Circle, Polyline, InfoWindow, useLoadScript } from '@react-google-maps/api';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_SCRIPT_ID } from '../Create/geofencingGoogleMapsApi';

// Google Maps configuration
const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px'
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
};

const RegionMap = ({ show, handleClose, regions = [], mapHtml = null }) => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [mapZoom, setMapZoom] = useState(2);

    // Load Google Maps API
    const { isLoaded, loadError } = useLoadScript({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    // Calculate map center and zoom based on regions
    useEffect(() => {
        if (regions.length > 0) {
            const validRegions = regions.filter(region => 
                region.latitude && region.longitude && 
                !isNaN(parseFloat(region.latitude)) && 
                !isNaN(parseFloat(region.longitude))
            );

            if (validRegions.length > 0) {
                // Calculate center point
                const totalLat = validRegions.reduce((sum, region) => sum + parseFloat(region.latitude), 0);
                const totalLng = validRegions.reduce((sum, region) => sum + parseFloat(region.longitude), 0);
                
                const centerLat = totalLat / validRegions.length;
                const centerLng = totalLng / validRegions.length;
                
                setMapCenter({ lat: centerLat, lng: centerLng });
                
                // Calculate appropriate zoom level based on region spread
                const lats = validRegions.map(r => parseFloat(r.latitude));
                const lngs = validRegions.map(r => parseFloat(r.longitude));
                const latRange = Math.max(...lats) - Math.min(...lats);
                const lngRange = Math.max(...lngs) - Math.min(...lngs);
                const maxRange = Math.max(latRange, lngRange);
                
                // Adjust zoom based on spread
                let zoom = 10;
                if (maxRange > 10) zoom = 4;
                else if (maxRange > 5) zoom = 6;
                else if (maxRange > 2) zoom = 8;
                else if (maxRange > 1) zoom = 10;
                else if (maxRange > 0.5) zoom = 12;
                else zoom = 14;
                
                setMapZoom(zoom);
            }
        }
    }, [regions]);

    // Prepare markers data for Google Maps
    const markers = useMemo(() => {
        return regions
            .filter(region => 
                region.latitude && region.longitude && 
                !isNaN(parseFloat(region.latitude)) && 
                !isNaN(parseFloat(region.longitude))
            )
            .map((region, index) => ({
                id: index,
                position: {
                    lat: parseFloat(region.latitude),
                    lng: parseFloat(region.longitude)
                },
                region: region,
                title: region.placeName || `Region ${index + 1}`
            }));
    }, [regions]);

    // Prepare circles data for Google Maps
    const circles = useMemo(() => {
        return regions
            .filter(region => 
                region.latitude && region.longitude && region.radius &&
                !isNaN(parseFloat(region.latitude)) && 
                !isNaN(parseFloat(region.longitude)) &&
                !isNaN(parseFloat(region.radius))
            )
            .map((region, index) => ({
                id: index,
                center: {
                    lat: parseFloat(region.latitude),
                    lng: parseFloat(region.longitude)
                },
                radius: parseFloat(region.radius),
                region: region
            }));
    }, [regions]);

    // Prepare polyline data to connect all regions
    const polylinePath = useMemo(() => {
        if (markers.length < 2) return [];
        
        return markers.map(marker => marker.position);
    }, [markers]);

    // Handle map loading
    const onMapLoad = (map) => {
        // Map is loaded and ready
    };

    // Handle marker click
    const onMarkerClick = (marker) => {
        setSelectedRegion(marker.region);
    };

    // Handle circle click
    const onCircleClick = (circle) => {
        setSelectedRegion(circle.region);
    };

    if (loadError) {
        return (
            <RSModal
                show={show}
                size="xl"
                header="Region Map View"
                handleClose={handleClose}
                isCloseButton={true}
                body={
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <p style={{ color: '#dc3545' }}>Error loading Google Maps. Please check your API key configuration.</p>
                    </div>
                }
                footer={
                    <RSPrimaryButton onClick={handleClose}>
                        Close
                    </RSPrimaryButton>
                }
            />
        );
    }

    if (!isLoaded) {
        return (
            <RSModal
                show={show}
                size="xl"
                header="Region Map View"
                handleClose={handleClose}
                isCloseButton={true}
                body={
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <p>Loading Google Maps...</p>
                    </div>
                }
                footer={
                    <RSPrimaryButton onClick={handleClose}>
                        Close
                    </RSPrimaryButton>
                }
            />
        );
    }

    return (
        <RSModal
            show={show}
            size="xl"
            header="Region Map View"
            handleClose={handleClose}
            isCloseButton={true}
            body={
                <div style={{ padding: '20px 0' }}>
                    {regions.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px',
                            color: '#6c757d'
                        }}>
                            <i className={`${map_marker_mini} icon-lg`} style={{ marginBottom: '16px' }} />
                            <p>No regions to display on the map.</p>
                            <p style={{ fontSize: '14px' }}>Add some regions to see them visualized here.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ margin: '0', color: '#666' }}>
                                    <i className={`${info_mini} mr5`} />
                                    Click on any region to view its details. 
                                    {regions.length} region{regions.length !== 1 ? 's' : ''} displayed.
                                </p>
                            </div>
                            
                            {/* Google Map Container */}
                            <div style={{ 
                                width: '100%', 
                                height: '400px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    options={mapOptions}
                                    onLoad={onMapLoad}
                                >
                                    {/* Render markers */}
                                    {markers.map((marker) => (
                                        <Marker
                                            key={marker.id}
                                            position={marker.position}
                                            title={marker.title}
                                            onClick={() => onMarkerClick(marker)}
                                        />
                                    ))}

                                    {/* Render circles */}
                                    {circles.map((circle) => (
                                        <Circle
                                            key={circle.id}
                                            center={circle.center}
                                            radius={circle.radius}
                                            options={{
                                                fillColor: '#4285F4',
                                                fillOpacity: 0.2,
                                                strokeColor: '#4285F4',
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                            }}
                                            onClick={() => onCircleClick(circle)}
                                        />
                                    ))}

                                    {/* Render connecting lines */}
                                    {polylinePath.length > 1 && (
                                        <Polyline
                                            path={polylinePath}
                                            options={{
                                                strokeColor: '#FF0000',
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                            }}
                                        />
                                    )}

                                    {/* Info Window */}
                                    {selectedRegion && (
                                        <InfoWindow
                                            position={{
                                                lat: parseFloat(selectedRegion.latitude),
                                                lng: parseFloat(selectedRegion.longitude)
                                            }}
                                            onCloseClick={() => setSelectedRegion(null)}
                                        >
                                            <div style={{ padding: '8px', minWidth: '200px' }}>
                                                <h6 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                                                    {selectedRegion.placeName || 'Region'}
                                                </h6>
                                                <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                                    <div><strong>Latitude:</strong> {selectedRegion.latitude}</div>
                                                    <div><strong>Longitude:</strong> {selectedRegion.longitude}</div>
                                                    <div><strong>Radius:</strong> {selectedRegion.radius ? `${selectedRegion.radius}m` : 'N/A'}</div>
                                                    {selectedRegion.jsonData && selectedRegion.jsonData.length > 0 && (
                                                        <div style={{ marginTop: '8px' }}>
                                                            <strong>Custom Data:</strong>
                                                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                                                                {selectedRegion.jsonData.map((data, index) => (
                                                                    <li key={index} style={{ fontSize: '11px' }}>
                                                                        {data.eventName}: {data.eventValue}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            </div>
                            
                            {/* Region Info Panel */}
                            {selectedRegion && (
                                <div style={{ 
                                    padding: '16px', 
                                    backgroundColor: '#f8f9fa', 
                                    borderRadius: '8px',
                                    marginTop: '16px'
                                }}>
                                    <h6 style={{ marginBottom: '12px', fontWeight: 'bold' }}>Selected Region Details</h6>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                                        <div><strong>Name:</strong> {selectedRegion.placeName || 'N/A'}</div>
                                        <div><strong>Latitude:</strong> {selectedRegion.latitude || 'N/A'}</div>
                                        <div><strong>Longitude:</strong> {selectedRegion.longitude || 'N/A'}</div>
                                        <div><strong>Radius:</strong> {selectedRegion.radius ? `${selectedRegion.radius}m` : 'N/A'}</div>
                                    </div>
                                    {selectedRegion.jsonData && selectedRegion.jsonData.length > 0 && (
                                        <div style={{ marginTop: '12px' }}>
                                            <strong>Custom Data:</strong>
                                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                                                {selectedRegion.jsonData.map((data, index) => (
                                                    <li key={index}>
                                                        {data.eventName}: {data.eventValue}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Legend */}
                            <div style={{ 
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}>
                                <strong>Legend:</strong>
                                <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ 
                                            display: 'inline-block', 
                                            width: '12px', 
                                            height: '12px', 
                                            backgroundColor: '#4285F4', 
                                            borderRadius: '50%',
                                            marginRight: '8px'
                                        }}></span>
                                        Region boundaries
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ 
                                            display: 'inline-block', 
                                            width: '8px', 
                                            height: '8px', 
                                            backgroundColor: '#333', 
                                            borderRadius: '50%',
                                            marginRight: '8px'
                                        }}></span>
                                        Region centers
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ 
                                            display: 'inline-block', 
                                            width: '20px', 
                                            height: '2px', 
                                            backgroundColor: '#FF0000',
                                            marginRight: '8px'
                                        }}></span>
                                        Connecting lines
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            }
            footer={
                <RSPrimaryButton onClick={handleClose}>
                    Close
                </RSPrimaryButton>
            }
        />
    );
};

export default RegionMap;
