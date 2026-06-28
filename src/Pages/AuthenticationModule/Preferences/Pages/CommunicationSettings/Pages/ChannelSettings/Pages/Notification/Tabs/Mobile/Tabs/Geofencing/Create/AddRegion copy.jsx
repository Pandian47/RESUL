import { MAX_LENGTH100, MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { checkbox_mini, circle_exclamation_mini, circle_minus_fill_edge_medium, circle_plus_fill_edge_medium, circle_question_mark_mini, close_mini, location_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { checkValidGeoFence } from 'Reducers/preferences/CommunicationSettings/Geofencing/request';
import MapPicker from './MapPicker';
//import MapModal from '../../../../../../Audience/Pages/DynamicListCreation/Component/MapModal/MapModal';
import MapModal from 'Pages/AuthenticationModule/Audience/Pages/DynamicListCreation/Component/MapModal/MapModal';

const MAX_CUSTOM_DATA = 5;

const DEFAULT_VALUES = {
    placeName: '',
    latitude: '',
    longitude: '',
    radius: '',
    customDataEnabled: false,
    customData: [
        { key: '', value: '', isDropdown: true },
    ],
};

const AddRegion = ({
    show,
    handleClose = () => { },
    onAdd = () => { },
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
    const { control, handleSubmit, watch, setValue, setError: setFormError, clearErrors: clearFormErrors } = methods;
    const { fields, append, remove, update } = useFieldArray({ control, name: 'customData' });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [mapInitialPosition, setMapInitialPosition] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0); // 0 for manual, 1 for map
    const [showMapModal, setShowMapModal] = useState(false);

    // Reset values whenever modal is shown or initialValues change
    useEffect(() => {
        if (!show) {
            setSuccessMessage('');
            setErrorMessage('');
            setActiveTabIndex(0);
            setShowMapModal(false);
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

            const preset = {
                placeName: initialValues?.placeName || '',
                latitude: initialValues?.latitude || '',
                longitude: initialValues?.longitude || '',
                radius: initialValues?.radius || '',
                customDataEnabled: !!hasCustom,
                customData: hasCustom
                    ? initialValues.customData.map((cd) => ({
                          key: cd?.key || '',
                          value: cd?.value || '',
                          isDropdown: cd?.isDropdown === false ? false : true,
                      }))
                    : [{ key: '', value: '', isDropdown: true }],
            };
            methods.reset(preset);
        } else {
            methods.reset(DEFAULT_VALUES);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, initialValues]);

    // Handle tab change
    useEffect(() => {
        if (activeTabIndex === 1 && show) {
            setShowMapModal(true);
        } else {
            setShowMapModal(false);
        }
    }, [activeTabIndex, show]);

    const customDataEnabled = watch('customDataEnabled');
    
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
    const renderManualTab = () => (
        <div>
            {/* Pick Location Button */}
            {/* <div className="form-group">
                <Row>
                    <Col sm={3} className="text-right"></Col>
                    <Col sm={9}>
                        <RSSecondaryButton 
                            onClick={handleOpenMapPicker}
                            className="mb15"
                        >
                            <i className={`${location_mini} icon-sm mr5`} />
                            Pick Location
                        </RSSecondaryButton>
                        <span className="ml10 text-muted" style={{ fontSize: '13px' }}>
                            Click to select location from map
                        </span>
                    </Col>
                </Row>
            </div> */}

            <div className="form-group">
                <Row>
                    <Col sm={3} className="text-right">
                        <label className="control-label-left">Place name</label>
                    </Col>
                    <Col sm={8}>
                        <Row>
                            <Col sm={10}>
                                <RSInput
                                    name={'placeName'}
                                    control={control}
                                    placeholder={'Enter place name'}
                                    required
                                    maxLength={MAX_LENGTH100}
                                    rules={{ required: 'Enter place name' }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={3} className="text-right">
                        <label className="control-label-left">Latitude</label>
                    </Col>
                    <Col sm={8}>
                        <Row>
                            <Col sm={10}>
                                <RSInput
                                    name={'latitude'}
                                    control={control}
                                    placeholder={'Enter latitude'}
                                    required
                                    rules={{
                                        required: 'Enter latitude',
                                        pattern: {
                                            value: /^-?\d+(\.\d{1,6})?$/,
                                            message: 'Latitude must be a valid number with up to 6 decimal places'
                                        },
                                        validate: (v) => {
                                            const num = parseFloat(v);
                                            if (isNaN(num)) return 'Enter valid latitude';
                                            if (num < -90 || num > 90) return 'Latitude must be between -90 and 90';
                                            const decimalPart = v.split('.')[1];
                                            if (decimalPart && decimalPart.length > 6) {
                                                return 'Latitude can have maximum 6 decimal places';
                                            }
                                            return true;
                                        },
                                    }}
                                    maxLength={20}
                                    onKeyDown={(e) => {
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
                                                if (cursorPos > decimalIndex && decimalPart.length >= 6) {
                                                    e.preventDefault();
                                                }
                                            }
                                            return;
                                        }
                                        
                                        e.preventDefault();
                                    }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={3} className="text-right">
                        <label className="control-label-left">Longitude</label>
                    </Col>
                    <Col sm={8}>
                        <Row>
                            <Col sm={10}>
                                <RSInput
                                    name={'longitude'}
                                    control={control}
                                    placeholder={'Enter longitude'}
                                    required
                                    rules={{
                                        required: 'Enter longitude',
                                        pattern: {
                                            value: /^-?\d+(\.\d{1,6})?$/,
                                            message: 'Longitude must be a valid number with up to 6 decimal places'
                                        },
                                        validate: (v) => {
                                            const num = parseFloat(v);
                                            if (isNaN(num)) return 'Enter valid longitude';
                                            if (num < -180 || num > 180) return 'Longitude must be between -180 and 180';
                                            const decimalPart = v.split('.')[1];
                                            if (decimalPart && decimalPart.length > 6) {
                                                return 'Longitude can have maximum 6 decimal places';
                                            }
                                            return true;
                                        },
                                    }}
                                    maxLength={20}
                                    onKeyDown={(e) => {
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
                                                if (cursorPos > decimalIndex && decimalPart.length >= 6) {
                                                    e.preventDefault();
                                                }
                                            }
                                            return;
                                        }
                                        
                                        e.preventDefault();
                                    }}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={3} className="text-right">
                        <label className="control-label-left">Radius(m)</label>
                    </Col>
                    <Col sm={8}>
                        <Row>
                            <Col sm={10}>
                                <RSInput
                                    name={'radius'}
                                    control={control}
                                    placeholder={'Enter Radius'}
                                    required
                                    maxLength={4}
                                    rules={{
                                        required: 'Enter radius',
                                        pattern: { value: /^\d+(?:\.\d+)?$/, message: 'Enter valid radius' },
                                        validate: (v) => {
                                            const num = parseFloat(v);
                                            if (isNaN(num)) return 'Enter valid radius';
                                            if (num <= 0) return 'Radius must be greater than 0';
                                            if (num > 1000) return 'Radius must not exceed 1000 meters';
                                            return true;
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
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={3} className="text-right">
                        <label className="control-label-left">Custom data</label>
                    </Col>
                    <Col sm={8}>
                        <div className="d-flex align-items-center">
                            <RSSwitch
                                name="customDataEnabled" control={control}
                                defaultValue={false}
                                onLabel="ON"
                                offLabel="OFF"
                                handleChange={(val) => {
                                    setValue('customData', [{ key: '', value: '', isDropdown: true }]);
                                }}
                            />
                            <RSTooltip position="top" text={'Use custom data for advanced targeting and add up to 5 custom tags per region'} className="lh0">
                                <i className={`${circle_question_mark_mini} icon-xs color-primary-blue ml10`} />
                            </RSTooltip>
                        </div>
                    </Col>
                </Row>
            </div>

            {customDataEnabled && (
                <div className="form-group">
                    {fields.map((field, index) => (
                        <Row key={field.id} className="mb10">
                            <Col sm={3} className="text-right">
                                {index === 0 && <label className="control-label-left">&nbsp;</label>}
                            </Col>
                            <Col sm={8}>
                                <Row>
                                    <Col sm={5}>
                                        {field?.isDropdown === false ? (
                                            <div className="position-relative">
                                                <RSInput
                                                    name={`customData[${index}].key`}
                                                    control={control}
                                                    placeholder={'Enter attribute name'}
                                                    required
                                                    rules={{ required: 'Enter attribute name' }}
                                                    className='pr20'
                                                />
                                                <RSTooltip position="top" text={'Close'} className="lh0">
                                                    <i
                                                        className={`${close_mini} icon-sm color-primary-red position-absolute top7 right0`}
                                                        onClick={() => {
                                                            const updatedField = {
                                                                ...fields[index],
                                                                isDropdown: true,
                                                                key: '',
                                                                id: null
                                                            };
                                                            update(index, updatedField);
                                                            setValue(`customData[${index}].key`, '');
                                                        }}
                                                    />
                                                </RSTooltip>
                                            </div>
                                        ) : (
                                            <RSKendoDropDownList
                                                name={`customData[${index}].key`}
                                                label={'Select attribute'}
                                                control={control}
                                                optionLabel={'Add attributes'}
                                                className='mb30'
                                                data={getFilteredTags(index)}
                                                required
                                                textField={'value'}
                                                dataItemKey={'id'}
                                                rules={{ required: 'Select attribute' }}
                                                handleChange={(e) => {
                                                    const value = e?.target?.value;
                                                    const updatedField = {
                                                        ...fields[index],
                                                        id: value?.id,
                                                        key: value.id === 1000 ? '' : value,
                                                        isDropdown: value.id !== 1000,
                                                        value: value.id === 1000 ? '' : `[[${value?.value}]]`
                                                    };
                                                    update(index, updatedField);
                                                }}
                                            />
                                        )}
                                    </Col>
                                    <Col sm={5} className='mb30'>
                                        <RSInput
                                            className={`${field?.isDropdown === false ? '' : 'click-off'}`}
                                            name={`customData[${index}].value`}
                                            control={control}
                                            placeholder={'Custom value'}
                                            required
                                            maxLength={MAX_LENGTH50}
                                            rules={{ required: 'Enter custom value' }}
                                            handleOnBlur={(e) => {
                                                if (fields[index]?.isDropdown !== false) {
                                                    const updatedField = {
                                                        ...fields[index],
                                                        isDropdown: false,
                                                    };
                                                    update(index, updatedField);
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col sm={2} className="d-flex align-items-center mt-30">
                                        {index === 0 ? (
                                            <RSTooltip position="top" text={'Add'} className="lh0">
                                                <i
                                                    className={`icon-md color-primary-blue ${circle_plus_fill_edge_medium} ${fields.length < MAX_CUSTOM_DATA ? '' : 'click-off'}`}
                                                    onClick={() => {
                                                        handleAddRow();
                                                    }}
                                                />
                                            </RSTooltip>
                                        ) : index > 0 ? (
                                            <RSTooltip position="top" text={'Remove'} className="lh0">
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
                            </Col>
                        </Row>
                    ))}
                </div>
            )}
        </div>
    );

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

            // Build the new region object
            const newRegion = {
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
            if (isEditMode && editIndex !== null && editIndex !== undefined) {
                allRegions[editIndex] = newRegion;
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
                appList: mobileApp ? [{
                    appId: mobileApp.appGuid,
                    appName: mobileApp.appName,
                }] : [],
                cluster: allRegions,
            };

            // Call validation API
            const response = await dispatch(checkValidGeoFence(payload));

            if (response?.status) {
                // Validation successful - call parent onAdd
                onAdd(data);
                
                if (isEditMode) {
                    // Edit mode - show success message and close modal
                    setSuccessMessage('Region updated successfully');
                    setTimeout(() => {
                        setSuccessMessage('');
                        handleClose();
                        setIsSubmitting(false);
                    }, 1500);
                } else {
                    // Add mode - show success message, reset form, keep modal open
                    setSuccessMessage('Region added successfully');
                    methods.reset(DEFAULT_VALUES);
                    setIsSubmitting(false);
                    
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

    const getTags = () => {
        let arr = [
            { id: 0, value: "DEVICE_OS" },
            { id: 1, value: "DEVICE_TYPE" },
            { id: 2, value: "APP_VERSION" },
            { id: 1000, value: "CUSTOM" },
        ];
        return arr;
    };
    const getFilteredTags = (currentIndex) => {
        const selectedIds = fields
            .filter((_, i) => i !== currentIndex)
            .map(item => item?.key?.id)
            .filter(id => id !== 1000); // exclude custom tag

        return getTags().filter(tag => tag.id === 1000 || !selectedIds.includes(tag.id));
    };

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
                size="lg"
                header={isEditMode ? 'Update region' : 'Add new region'}
                handleClose={() => {
                    setSuccessMessage('');
                    setErrorMessage('');
                    setIsSubmitting(false);
                    handleClose(false);
                }}
                isCloseButton={true}
                body={
                    <div>
                        {/* Success Message Toast */}
                        {successMessage && (
                            <div 
                                className="alert alert-success mb20" 
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '4px',
                                    backgroundColor: '#d4edda',
                                    border: '1px solid #c3e6cb',
                                    color: '#155724',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <i className={`${checkbox_mini} icon-md mr10`} style={{ color: '#28a745' }} />
                                    <span>{successMessage}</span>
                                </div>
                            </div>
                        )}

                        {/* Error Message Toast */}
                        {errorMessage && (
                            <div 
                                className="alert alert-danger mb20" 
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '4px',
                                    backgroundColor: '#f8d7da',
                                    border: '1px solid #f5c6cb',
                                    color: '#721c24',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <i className={`${circle_exclamation_mini} icon-md mr10`} style={{ color: '#dc3545' }} />
                                    <span>{errorMessage}</span>
                                </div>
                                <i 
                                    className={`${close_mini} icon-sm cursor-pointer`}
                                    onClick={() => setErrorMessage('')}
                                />
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
                    </div>
                }
                footer={
                    <>
                        <RSSecondaryButton 
                            onClick={() => {
                                setSuccessMessage('');
                                setErrorMessage('');
                                handleClose(false);
                            }}
                            disabled={isSubmitting}
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
        </FormProvider>
    );
};

export default AddRegion;


