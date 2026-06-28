import { map_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useState } from 'react';
import {
    GoogleMap,
    DrawingManager,
    Marker,
    useLoadScript,
    Rectangle,
    Circle,
    Polygon,
    Polyline,
} from '@react-google-maps/api';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import './map.css';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { googleAPIKey } from './constant';
const MapModal = ({ show, handleClose, name }) => {
    const { control, setValue, watch, resetField } = useFormContext();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: googleAPIKey,
        libraries: ['drawing'],
    });
    const [LocationList, setLocationList] = useState({
        shape: '',
        latlng: '',
    });
    const [region, setRegion] = useState([]);
    const [mapList, setMapList] = useState([]);
    // console.log('mapList', mapList);
    // console.log('LocationList', LocationList);

    const [regionName, latitude, longitude, radiusValue, radiusType, shortURL] = watch([
        `${name}.regionName`,
        `${name}.latitude`,
        `${name}.longitude`,
        `${name}.radiusValue`,
        `${name}.radiusType`,
        `${name}.shortURL`,
        // `${name}.mapList`,
    ]);
    var options = {
        strokeColor: 'blue',
        strokeOpacity: 0.5,
        strokeWeight: 3.0,
        fillColor: 'blue',
        fillOpacity: 0.2,
    };
    const center = useMemo(() => ({ lat: 29.951065, lng: -90.071533 }), []);
    const handleAdd = () => {
        let temp = [...mapList];
        if (LocationList?.shape === 'Circle') {
            temp.push({
                title: regionName,
                shape: 'Circle',
                value: `${latitude}, ${longitude}, ${radiusValue} ${radiusType}`,
            });
        } else if (LocationList?.shape === 'Rectangle') {
            temp.push({
                title: regionName,
                shape: 'Rectangle',
                value: LocationList?.latlng,
            });
        } else {
            if (Array.isArray(LocationList?.latlng)) {
                let value = LocationList?.latlng.map(point => `${point.lat}, ${point.lng}`).join('; ');
                temp.push({
                    title: regionName,
                    shape: LocationList?.shape,
                    value: value,
                });
            } else {
                temp.push({
                    title: regionName,
                    shape: 'Marker',
                    value: `${latitude}, ${longitude}`,
                });
            }
            setValue(`${name}.radiusValue`, '');
        }

        setMapList(temp);
        setLocationList({
            shape: '',
            latlng: '',
        });
        setValue(`${name}.mapList`, temp);
        setValue(`${name}.regionName`, '');
        resetField(`${name}.radiusValue`);
        resetField(`${name}.latitude`);
        resetField(`${name}.longitude`);
        resetField(`${name}.radiusType`);
    };

    function GenerateShortUrl(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    const cancelReset = () => {
        resetField(`${name}.radiusValue`);
        resetField(`${name}.latitude`);
        resetField(`${name}.longitude`);
        resetField(`${name}.radiusType`);
        setRegion([]);
        setLocationList({
            shape: '',
            latlng: '',
        });
        setValue(`${name}.shortURL`, '');
        handleClose();
    };

    // useEffect(() => {
    //     console.log('LocationList changed:', LocationList);
    //     if (LocationList.shape) { // Assuming shape indicates a valid location to add
    //         setMapList(prevList => [...prevList, LocationList]);
    //     }
    // }, [LocationList]);
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            size="xxlg"
            header={'Map Location'}
            body={
                <Row className="mb20">
                    <Col sm={8}>
                        <div className="map-modal">
                            {!isLoaded ? (
                                <h1>Loading...</h1>
                            ) : (
                                <GoogleMap mapContainerClassName="map-container" center={center} zoom={12}>
                                    {mapList?.length !== 0 ? (
                                        mapList?.map((item, idx) => {
                                            switch (item.shape) {
                                                case 'Circle':
                                                    return (
                                                        <Circle
                                                            key={idx}
                                                            center={{
                                                                lat: parseFloat(item.value?.split(',')[0]),
                                                                lng: parseFloat(item.value?.split(',')[1]),
                                                            }}
                                                            radius={parseFloat(item.value?.split(',')[2])}
                                                            options={{
                                                                fillColor: 'blue',
                                                                fillOpacity: 0.3,
                                                                strokeWeight: 2,
                                                                strokeColor: 'blue',
                                                                clickable: false,
                                                                editable: true,
                                                                zIndex: 1,
                                                            }}
                                                        />
                                                    );
                                                case 'Rectangle':
                                                    let rect = item.value;
                                                    let rectangleBounds = {
                                                        north: rect[0],
                                                        south: rect[1],
                                                        east: rect[2],
                                                        west: rect[3],
                                                    };

                                                    return (
                                                        <Rectangle
                                                            key={idx}
                                                            bounds={rectangleBounds}
                                                            options={options}
                                                        />
                                                    );
                                                case 'Polygon':
                                                    let temp = item.value.split(';');
                                                    let polygonOptions = [];
                                                    for (let i = 0; i < temp?.length; i++) {
                                                        polygonOptions.push({
                                                            lat: parseFloat(temp[i].split(',')[0]),
                                                            lng: parseFloat(temp[i].split(',')[1]),
                                                        });
                                                    }
                                                    return (
                                                        <Polygon key={idx} path={polygonOptions} options={options} />
                                                    );
                                                case 'Polyline':
                                                    let temp1 = item.value.split(';');
                                                    let polylineOptions = [];
                                                    for (let i = 0; i < temp1?.length; i++) {
                                                        polylineOptions.push({
                                                            lat: parseFloat(temp1[i].split(',')[0]),
                                                            lng: parseFloat(temp1[i].split(',')[1]),
                                                        });
                                                    }
                                                    return (
                                                        <Polyline key={idx} path={polylineOptions} options={options} />
                                                    );

                                                case 'Marker':
                                                    return (
                                                        <Marker
                                                            key={idx}
                                                            position={{
                                                                lat: parseFloat(item.value?.split(',')[0]),
                                                                lng: parseFloat(item.value?.split(',')[1]),
                                                            }}
                                                        />
                                                    );
                                            }
                                        })
                                    ) : (
                                        <Marker
                                            position={{ lat: 29.951065, lng: -90.071533 }}
                                        // icon={`${map_large} icon-lg color-primary-red`}
                                        />
                                    )}
                                    <DrawingManager
                                        defaultDrawingMode={google.maps.drawing.OverlayType.CIRCLE}
                                        defaultOptions={{
                                            drawingControl: true,
                                            drawingControlOptions: {
                                                position: google.maps.ControlPosition.TOP_RIGHT,
                                                drawingModes: [
                                                    google.maps.drawing.OverlayType.CIRCLE,
                                                    google.maps.drawing.OverlayType.POLYGON,
                                                    google.maps.drawing.OverlayType.POLYLINE,
                                                    google.maps.drawing.OverlayType.RECTANGLE,
                                                ],
                                            },
                                            circleOptions: {
                                                fillColor: `#0018f9`,
                                                fillOpacity: 1,
                                                strokeWeight: 5,
                                                clickable: false,
                                                editable: true,
                                                zIndex: 1,
                                            },
                                        }}
                                        onMarkerComplete={(e) => {
                                            setLocationList({
                                                shape: 'Marker',
                                                latlng: {
                                                    lat: e.position.lat(),
                                                    lng: e.position.lng(),
                                                },
                                            });
                                            setValue(`${name}.latitude`, e.position.lat());
                                            setValue(`${name}.longitude`, e.position.lng());
                                        }}
                                        onCircleComplete={(e) => {
                                            setLocationList({
                                                shape: 'Circle',
                                                latlng: {
                                                    lat: e.center.lat(),
                                                    lng: e.center.lng(),
                                                },
                                            });
                                            setValue(`${name}.latitude`, e.center.lat());
                                            setValue(`${name}.longitude`, e.center.lng());
                                            setValue(`${name}.radiusValue`, e.radius);
                                        }}
                                        onPolylineComplete={(e) => {
                                            setLocationList({
                                                shape: 'Polyline',
                                                latlng: e
                                                    .getPath()
                                                    .getArray()
                                                    .map((point) => ({
                                                        lat: point.lat(),
                                                        lng: point.lng(),
                                                    })),
                                            });
                                            setValue(`${name}.latitude`, e.map.center.lat());
                                            setValue(`${name}.longitude`, e.map.center.lng());
                                        }}
                                        onRectangleComplete={(e) => {
                                            let temp = [
                                                e.getBounds().getNorthEast().lat(),
                                                e.getBounds().getSouthWest().lat(),
                                                e.getBounds().getNorthEast().lng(),
                                                e.getBounds().getSouthWest().lng(),
                                            ];

                                            setLocationList({
                                                shape: 'Rectangle',
                                                latlng: temp,
                                            });
                                            setValue(`${name}.latitude`, e.map.center.lat());
                                            setValue(`${name}.longitude`, e.map.center.lng());
                                        }}
                                        onPolygonComplete={(e) => {
                                            setLocationList({
                                                shape: 'Polygon',
                                                latlng: e
                                                    .getPath()
                                                    .getArray()
                                                    .map((point) => ({
                                                        lat: point.lat(),
                                                        lng: point.lng(),
                                                    })),
                                            });
                                            setValue(`${name}.latitude`, e.map.center.lat());
                                            setValue(`${name}.longitude`, e.map.center.lng());
                                        }}
                                    />
                                </GoogleMap>
                            )}
                        </div>
                    </Col>
                    <Col sm={4}>
                        <div className="form-group">
                            <h3 className="rsmdc-header mb10">Add zone</h3>
                            <div className="box-design no-box-shadow">
                                <div className="form-group mt10">
                                    <RSInput
                                        control={control}
                                        name={`${name}.regionName`}
                                        label={'Region Name'}
                                        required
                                    />
                                </div>
                                {Array.isArray(LocationList?.latlng) ? (
                                    <div className="form-group">
                                        <h4 className="float-start mb10 width100p">Region co-ordinates</h4>
                                        {LocationList?.shape === 'Rectangle'
                                            ? LocationList?.latlng?.map((item, idx) => <span key={idx}>{item}</span>)
                                            : LocationList?.latlng?.map((item, idx) => (
                                                <span key={idx}>{item?.lat + ', ' + item?.lng}</span>
                                            ))}
                                    </div>
                                ) : (
                                    <>
                                        <Row className="form-group">
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`${name}.latitude`}
                                                    required
                                                    label={'Latitude'}
                                                />
                                            </Col>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`${name}.longitude`}
                                                    required
                                                    label={'Longitude'}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="form-group">
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`${name}.radiusValue`}
                                                    required
                                                    label={'Radius'}
                                                />
                                            </Col>
                                            <Col sm={1}>/</Col>

                                            <Col>
                                                <RSKendoDropdown
                                                    control={control}
                                                    name={`${name}.radiusType`}
                                                    data={['Miles', 'KM', 'Feet', 'Meters']}
                                                    defaultValue={'Miles'}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                )}

                                <div className="buttons-holder m0">
                                    <RSSecondaryButton onClick={cancelReset}>Cancel</RSSecondaryButton>
                                    <RSPrimaryButton className={LocationList.shape === '' && LocationList.latlng?.length === 0 ? 'click-off' : ''} onClick={() => handleAdd()}>Add</RSPrimaryButton>
                                </div>
                            </div>
                        </div>
                        <div className="form-group mb0">
                            <h3 className="rsmdc-header mb10">Zone list</h3>
                            <div className="box-design no-box-shadow">
                                {region?.length === 0 ? (
                                    <Row>
                                        {mapList?.length !== 0 ? (
                                            mapList?.map((item, idx) => (
                                                <div key={idx} className="d-flex flex-column mb20 pb10 border-bottom">
                                                    <span>{item.title}</span>
                                                    <span>{item.value}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="d-flex flex-column mb20 pb10 border-bottom">
                                                <span>{'New Orleans'}</span>
                                                <span>{center?.lat + ', ' + center?.lng}</span>
                                            </div>
                                        )}
                                    </Row>
                                ) : (
                                    region?.map((item, idx) => {
                                        return (
                                            <div key={idx} className="d-flex flex-column mb20 pb10 border-bottom">
                                                <span>{item?.title}</span>
                                                <span>{item?.value}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        {!!shortURL && (
                            <Row className="mt20">
                                <h3 className="mb20">Short URL: </h3>
                                <RSInput name={`${name}.shortURL`} control={control} required />
                            </Row>
                        )}
                    </Col>
                </Row >
            }
            footer={
                < div className="buttons-holder m0" >
                    <RSSecondaryButton
                        onClick={() => {
                            // setDeleteRule(false);
                            cancelReset();
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        className={!!shortURL ? '' : 'click-off'}
                        onClick={() => {
                            setValue(`${name}.attributeValue`, `http://resu.io/${GenerateShortUrl(10)}^`);
                            handleClose();
                        }}
                    >
                        Save
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={!!shortURL ? 'click-off bg-secondary-blue' : 'bg-secondary-blue'}
                        onClick={() => {
                            // setDeleteRule(true);
                            // if (!isCount && value !== 'Select Form before Attributes') removeRule();

                            setValue(`${name}.shortURL`, `http://resu.io/${GenerateShortUrl(10)}^`);
                        }}
                    >
                        Generate
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default MapModal;
