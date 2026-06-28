import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { SELECT_END_DATE, SELECT_START_DATE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD, APP_NAME, DOWNLOAD_SAMPLE, END_DATE, START_DATE, UPLOAD_REGION_FILE, VIEW_REGION_MAP } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, builder_upload_large, circle_close_mini, circle_plus_fill_large, circle_question_mark_mini, csv_download_large, map_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

// Components
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import AddRegion from './AddRegion';
import RegionGrid from './RegionGrid';
import RegionUpload from '../Upload/RegionUpload';

// Constants
// Redux
import { getMobileApps } from 'Reducers/communication/createCommunication/smartlink/request';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getGeoFenceDetailsById,
    checkGeoFenceNameExists,
    saveGeoFence,
} from 'Reducers/preferences/CommunicationSettings/Geofencing/request';
import { checkValidGeoFence } from 'Reducers/preferences/CommunicationSettings/Geofencing/request';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { MOBILE_FORM_ACTIONS_PORTAL_ID } from '../../../constant';

const GEOFENCING_FORM_ID = 'rs_GeofencingCreate_Form';

// Constants
const MAX_REGIONS = 50;

const DEFAULT_VALUES = {
    clusterName: '',
    mobileApp: [],
    periodType: 'Life time',
    startDate: null,
    endDate: null,
    endMinValue: null,
    endMaxValue: null,
};

const FORMAT_DATE = 'dd-MM-yyyy';
const MIN_DAYS_RANGE = 3;
const MAX_DAYS_RANGE = 90;

/**
 * GeofencingCreate Component
 * Handles creation and editing of geofence location clusters
 *
 * @param {Function} onCancel - Callback when user cancels the form
 * @param {Function} onSave - Callback when form is successfully saved
 */
const GeofencingCreate = ({ onCancel = () => {}, onSave = () => {}, geoFenceId = 0 }) => {
    // Hooks
    const dispatch = useDispatch();
    const methods = useForm({ defaultValues: DEFAULT_VALUES, mode: 'onChange' });
    const { control, handleSubmit, watch, setValue, reset } = methods;
    const isEditMode = geoFenceId > 0;
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isEditMode ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;

    // State
    const [showAddRegion, setShowAddRegion] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapHtml, setMapHtml] = useState(null);
    const [regions, setRegions] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [regionError, setRegionError] = useState('');
    const [originalClusterName, setOriginalClusterName] = useState('');
    const [isEditDetailsLoading, setIsEditDetailsLoading] = useState(geoFenceId > 0);

    // Refs
    const departmentIdRef = useRef();
    const clientIdRef = useRef();

    // Selectors
    const { departmentId, userId, clientId, isAgency, departmentName } = useSelector(getSessionId);
    const { mobileApps } = useSelector((state) => state.smartLinkReducer ?? {});

    // Watched values
    const periodType = watch('periodType');
    const endMinValue = watch('endMinValue');
    const endMaxValue = watch('endMaxValue');
    const clusterName = watch('clusterName');
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const mobileApp = watch('mobileApp');

    // Check if form is valid for enabling buttons
    const isFormValid =
        clusterName && clusterName.trim() && mobileApp && Array.isArray(mobileApp) && mobileApp.length > 0;
    const [deleteRegion, setDeleteRegion] = useState([]);

    // Effects
    useEffect(() => {
        const shouldReload = departmentIdRef.current !== departmentId || clientIdRef.current !== clientId;

        departmentIdRef.current = departmentId;
        clientIdRef.current = clientId;

        fetchMobileApps(shouldReload);
    }, [departmentId, clientId, userId, isAgency, departmentName]);

    /**
     * Fetch mobile apps for dropdown
     */
    const fetchMobileApps = useCallback(
        async (reload = false) => {
            if (mobileApps?.length && !reload) return;

            const payload = {
                clientId,
                departmentId: departmentId || 0,
                userId,
                isAgency,
                departmentName,
            };

            await dispatch(getMobileApps({ payload, loading: false }));
        },
        [dispatch, clientId, departmentId, userId, isAgency, departmentName, mobileApps?.length],
    );

    const handleClusterNamePaste = useCallback(
        (e) => {
            e.preventDefault();

            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const cleanedText = pastedText.replace(/[^a-zA-Z0-9_ -]/g, '');
            if (!cleanedText) return;

            const input = e.target;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const currentValue = input.value || '';

            const candidateValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
            const maxLen = Number(MAX_LENGTH50) || 50;
            const newValue = candidateValue.substring(0, maxLen);

            const newCursorPos = Math.min(start + cleanedText.length, newValue.length);

            setValue('clusterName', newValue, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });

            window.requestAnimationFrame(() => {
                try {
                    input.setSelectionRange(newCursorPos, newCursorPos);
                } catch (_) {}
            });
        },
        [setValue],
    );

    /**
     * Handle start date change - set min/max for end date
     */
    const handleStartDateChange = useCallback(
        (e) => {
            const selectedDate = new Date(e.target.value);

            const minEndDate = new Date(selectedDate);
            minEndDate.setDate(selectedDate.getDate() + MIN_DAYS_RANGE);

            const maxEndDate = new Date(selectedDate);
            maxEndDate.setDate(selectedDate.getDate() + MAX_DAYS_RANGE);

            setValue('endMinValue', minEndDate);
            setValue('endMaxValue', maxEndDate);
        },
        [setValue],
    );

    /**
     * Handle form submission - validate and save geofence
     */
    const handleFormSubmit = useCallback(
        async (data) => {
            // Validate regions
            if (regions.length === 0) {
                setRegionError('Please add at least one region');
                return;
            }
            setRegionError('');

            // Build API payload
            const payload = {
                departmentId: departmentId || 0,
                geoFenceId: geoFenceId || 0,
                identifier: data.clusterName?.trim(),
                startDate:
                    data.periodType === 'Date range' && data?.startDate ? data?.startDate?.toLocaleDateString() : null,
                endDate: data.periodType === 'Date range' && data.endDate ? data.endDate?.toLocaleDateString() : null,
                isAllTime: data.periodType === 'Life time',
                appList:
                    Array.isArray(data.mobileApp) && data.mobileApp.length > 0
                        ? data.mobileApp.map((app) => ({
                              appId: app.appGuid,
                              appName: app.appName,
                          }))
                        : [],
                cluster: regions.map((region) => ({
                    regionId: region.regionId || undefined,
                    placeName: region.placeName,
                    latitude: region.latitude?.toString(),
                    longitude: region.longitude?.toString(),
                    radius: region.radius?.toString(),
                    jsonData:
                        region.customDataEnabled && Array.isArray(region.customData)
                            ? region.customData.map((item) => ({
                                  eventName: item.isDropdown && item.key?.value ? item.key.value : item.key,
                                  eventValue: item.value,
                              }))
                            : [],
                    isDelete: false,
                })),
                isDelete: false,
            };

            // In edit mode, merge deleted regions into payload.cluster if deleteRegion array length > 0
            if (geoFenceId > 0 && deleteRegion && deleteRegion.length > 0) {
                const deletedRegions = deleteRegion.map((region) => ({
                    regionId: region?.regionId || 0,
                    placeName: region?.placeName,
                    latitude: region?.latitude?.toString(),
                    longitude: region?.longitude?.toString(),
                    radius: region?.radius?.toString(),
                    jsonData:
                        region?.customDataEnabled && Array.isArray(region.customData)
                            ? region.customData.map((item) => ({
                                  eventName: item.isDropdown && item.key?.value ? item.key.value : item.key,
                                  eventValue: item.value,
                              }))
                            : [],
                    isDelete: true,
                }));
                payload.cluster = [...payload.cluster, ...deletedRegions];
            }

            // Save geofence
            const response = await saveApi.refetch({
            fetcher: () => dispatch(saveGeoFence(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: isEditMode ? 'edit' : 'create',
        });

            if (response?.status) {
                onSave(response);
            }
        },
        [saveApi.refetch, regions, geoFenceId, onSave, deleteRegion, departmentId, isEditMode, dispatch],
    );

    /**
     * Handle adding/editing region
     */
    const handleAddRegion = useCallback(
        (region) => {
            setRegions((prev) => {
                // Check region limit when adding new region (not editing)
                if (editIndex === null || editIndex === undefined) {
                    if (prev.length >= MAX_REGIONS) {
                        setRegionError(`Maximum limit of ${MAX_REGIONS} regions reached. Cannot add more regions.`);
                        return prev; // Don't add the region
                    }
                    return [...prev, region];
                }
                const updated = [...prev];
                updated[editIndex] = region;
                return updated;
            });

            // Clear region error when region is added (only if not at limit)
            if (editIndex === null || editIndex === undefined) {
                if (regions.length < MAX_REGIONS) {
                    setRegionError('');
                }
            } else {
                setRegionError('');
            }

            // Keep modal open for both add and edit modes to allow multiple regions
            // Modal close is handled by AddRegion component's Cancel button or Confirm button
            // Reset edit index after update to allow adding new regions
            if (editIndex !== null && editIndex !== undefined) {
                setEditIndex(null);
            }
        },
        [editIndex, regions.length],
    );

    /**
     * Handle deleting region
     */
    const handleDeleteRegion = useCallback((index) => {
        let temp = [...deleteRegion];
        let _tempRegions = [...regions];

        temp.push(_tempRegions[index]);
        setDeleteRegion(temp);
        _tempRegions.splice(index, 1);
        setRegions(_tempRegions);
    }, []);

    /**
     * Handle upload success - add uploaded regions to the regions list
     */
    const handleUploadSuccess = useCallback((uploadedRegions) => {
        if (uploadedRegions && uploadedRegions.length > 0) {
            setRegions((prev) => {
                const currentCount = prev.length;
                const totalCount = currentCount + uploadedRegions.length;

                if (totalCount > MAX_REGIONS) {
                    const availableSlots = MAX_REGIONS - currentCount;
                    setRegionError(
                        `Cannot add ${uploadedRegions.length} regions. Maximum allowed is ${MAX_REGIONS} regions. You currently have ${currentCount} region(s). You can only add ${availableSlots} more region(s).`,
                    );
                    return prev; // Don't add the regions
                }

                setRegionError('');
                return [...prev, ...uploadedRegions];
            });
        }
    }, []);

    /**
     * Handle map modal opening - call API to get map HTML
     */
    const handleMapModalOpen = useCallback(async () => {
        if (!isFormValid || regions.length === 0) {
            return;
        }

        try {
            // Build API payload for map generation
            const payload = {
                geoFenceId: geoFenceId || 0,
                Identifier: clusterName,
                startDate: periodType === 'Date range' ? startDate : null,
                endDate: periodType === 'Date range' ? endDate : null,
                isAllTime: periodType === 'Life time',
                appList:
                    Array.isArray(mobileApp) && mobileApp.length > 0
                        ? mobileApp.map((app) => ({
                              appId: app.appGuid,
                              appName: app.appName,
                          }))
                        : [],
                cluster: regions.map((region) => ({
                    placeName: region.placeName,
                    latitude: region.latitude?.toString(),
                    longitude: region.longitude?.toString(),
                    radius: region.radius?.toString(),
                    jsonData:
                        region.customDataEnabled && Array.isArray(region.customData)
                            ? region.customData
                                  .filter((item) => item.key && item.value)
                                  .map((item) => ({
                                      eventName: item.isDropdown && item.key?.value ? item.key.value : item.key,
                                      eventValue: item.value,
                                  }))
                            : [],
                })),
            };

            // Call validation API to get map HTML
            const response = await dispatch(checkValidGeoFence(payload));

            if (response?.status && response?.data?.mapView) {
                // Set the map HTML and open modal
                setMapHtml(response?.data?.mapView);
                setShowMapModal(true);
            } else {
                setRegionError('Failed to generate map view. Please try again.');
                setTimeout(() => setRegionError(''), 3000);
            }
        } catch (error) {
            setRegionError('Error generating map view. Please try again.');
            setTimeout(() => setRegionError(''), 3000);
        }
    }, [isFormValid, regions, geoFenceId, clusterName, periodType, startDate, endDate, mobileApp, dispatch]);

    /**
     * Handle validation error from upload - show error toast above regions grid
     */
    const handleValidationError = useCallback((errorMessage) => {
        setRegionError(errorMessage);
        // Auto-hide error after 3 seconds
        setTimeout(() => {
            setRegionError('');
        }, 3000);
    }, []);

    /**
     * Handle download sample files - downloads both CSV and Excel
     */
    const handleDownloadSample = useCallback(() => {
        const files = ['sample_cluster.csv', 'sample_cluster.xlsx'];

        files.forEach((fileName, index) => {
            setTimeout(async () => {
                try {
                    const response = await fetch(`/documents/${fileName}`);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } catch (error) {}
            }, index * 500); // 500ms delay between downloads
        });
    }, []);

    /**
     * Handle period type change - reset dates
     */
    const handlePeriodChange = useCallback(
        (type) => {
            setValue('startDate', null);
            setValue('endDate', null);
            if (type === 'Life time') {
                setValue('endMinValue', null);
                setValue('endMaxValue', null);
            }
        },
        [setValue],
    );

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(MOBILE_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
        };
    }, []);

    const renderFormActions = () => (
        <div className="buttons-holder pref-cs-buttons-outside mt20">
            <RSSecondaryButton
                type="button"
                blockInteraction={isSaveLoading}
                onClick={() => {
                    if (isSaveLoading) return;
                    onCancel();
                }}
                id="rs_GeofencingCreate_Cancel"
            >
                Cancel
            </RSSecondaryButton>
            <RSPrimaryButton
                type="submit"
                form={GEOFENCING_FORM_ID}
                isLoading={isSaveLoading}
                blockBodyPointerEvents={isSaveLoading}
                id="rs_GeofencingCreate_Save"
            >
                {geoFenceId > 0 ? 'Update' : 'Add'}
            </RSPrimaryButton>
        </div>
    );

    const formActions = actionsPortalTarget ? createPortal(renderFormActions(), actionsPortalTarget) : null;

    return (
        <>
            {/* Load geofence details when editing */}
            {geoFenceId > 0 && (
                <LoadGeoFenceDetails
                    geoFenceId={geoFenceId}
                    departmentId={departmentId}
                    clientId={clientId}
                    userId={userId}
                    setRegions={setRegions}
                    setValue={setValue}
                    reset={reset}
                    setOriginalClusterName={setOriginalClusterName}
                    setIsEditDetailsLoading={setIsEditDetailsLoading}
                />
            )}

            {/* Add/Edit Region Modal */}
            <AddRegion
                show={showAddRegion}
                handleClose={() => {
                    setShowAddRegion(false);
                    setEditIndex(null);
                }}
                attributeOptions={[]}
                initialValues={editIndex !== null && editIndex !== undefined ? regions[editIndex] : undefined}
                onAdd={handleAddRegion}
                onDelete={handleDeleteRegion}
                onEdit={(index) => {
                    setEditIndex(index);
                }}
                // Props for API validation
                geoFenceId={geoFenceId}
                clusterName={clusterName || ''}
                dateInfo={{
                    startDate: periodType === 'Date range' ? startDate : null,
                    endDate: periodType === 'Date range' ? endDate : null,
                    isAllTime: periodType === 'Life time',
                }}
                mobileApp={mobileApp}
                existingRegions={regions.map((region) => ({
                    placeName: region.placeName,
                    latitude: region.latitude?.toString(),
                    longitude: region.longitude?.toString(),
                    radiusType: '',
                    radius: region.radius?.toString(),
                    jsonData:
                        region.customDataEnabled && Array.isArray(region.customData)
                            ? region.customData
                                  .filter((item) => item.key && item.value)
                                  .map((item) => ({
                                      eventName: item.isDropdown && item.key?.value ? item.key.value : item.key,
                                      eventValue: item.value,
                                  }))
                            : [],
                }))}
                editIndex={editIndex}
            />

            <RegionUpload
                show={showUploadModal}
                handleClose={() => setShowUploadModal(false)}
                onUpload={handleUploadSuccess}
                onValidationError={handleValidationError}
                // Props for API validation
                geoFenceId={geoFenceId}
                clusterName={clusterName || ''}
                dateInfo={{
                    startDate: periodType === 'Date range' ? startDate : null,
                    endDate: periodType === 'Date range' ? endDate : null,
                    isAllTime: periodType === 'Life time',
                }}
                mobileApp={mobileApp}
                existingRegions={regions.map((region) => ({
                    placeName: region.placeName,
                    latitude: region.latitude?.toString(),
                    longitude: region.longitude?.toString(),
                    radiusType: '',
                    radius: region.radius?.toString(),
                    jsonData:
                        region.customDataEnabled && Array.isArray(region.customData)
                            ? region.customData
                                  .filter((item) => item.key && item.value)
                                  .map((item) => ({
                                      eventName: item.isDropdown && item.key?.value ? item.key.value : item.key,
                                      eventValue: item.value,
                                  }))
                            : [],
                }))}
            />
            {/* {regions?.length > 0 && <RegionMap
                show={showMapModal}
                handleClose={() => {
                    setShowMapModal(false);
                    setMapHtml(null); // Clear map HTML when closing
                }}
                regions={regions}
                mapHtml={mapHtml}
            />} */}
            <CommunicationSettingsEditSkeletonGate
                isLoading={isEditDetailsLoading}
                isEditMode={isEditMode}
                actionsPortalId={MOBILE_FORM_ACTIONS_PORTAL_ID}
            >
            <FormProvider {...methods}>
                <form id={GEOFENCING_FORM_ID} noValidate onSubmit={handleSubmit(handleFormSubmit)}>
                    {/* Form Header */}
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{geoFenceId > 0 ? 'Update location cluster' : 'Add location cluster'}</h4>
                        </div>
                    </div>

                    {/* Cluster Name */}
                    <div className="form-group">
                        <Row>
                            <Col sm={3} className="text-right">
                                <label className="control-label-left">Cluster name</label>
                            </Col>
                            <Col sm={8} className="pr45">
                                <Row>
                                    <Col sm={12}>
                                        <ListNameExists
                                            name="clusterName"
                                            field="identifier"
                                            apiCallback={checkGeoFenceNameExists}
                                            condition={(res) => !res?.status}
                                            currentValue={originalClusterName}
                                            placeholder="Cluster name"
                                            maxLength={MAX_LENGTH50}
                                            extraPayload={{}}
                                            customError="Cluster name already exists"
                                            customErrorMessage={ 'Enter cluster name'}
                                            rules={{
                                                required:  'Enter cluster name',
                                                pattern: {
                                                    value: /^[a-zA-Z0-9_ -]+$/,
                                                    message:
                                                        'Allowed only letters, numbers, spaces, hyphens (-), and underscores (_)',
                                                },
                                            }}
                                            settings={{
                                                handleOnPaste: handleClusterNamePaste,
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>

                    {/* Mobile Apps */}
                    <div className="form-group">
                        <Row>
                            <Col sm={3} className="text-right">
                                <label className="control-label-left">Mobile apps</label>
                            </Col>
                            <Col sm={8} className="pr45">
                                <Row>
                                    <Col sm={12}>
                                        <RSMultiSelect
                                            name="mobileApp"
                                            control={control}
                                            required
                                            label={APP_NAME || 'Mobile apps'}
                                            placeholder="Select mobile apps"
                                            textField="appName"
                                            dataItemKey="appGuid"
                                            data={mobileApps || []}
                                            rules={{ required: 'Select at least one mobile app' }}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>

                    {/* Period Type */}
                    <div className="form-group">
                        <Row>
                            <Col sm={3} className="text-right">
                                <label className="control-label-left">Period</label>
                            </Col>
                            <Col>
                                <div className="d-flex gap-3">
                                    <RSRadioButton
                                        name="periodType"
                                        id="geo_period_lifetime"
                                        control={control}
                                        // labelName="lifetime"
                                        labelName={'Life time'}
                                        isName
                                        customLabelclassName="mr5"
                                        radio_wrapper_class="mt0"
                                        handleChange={() => handlePeriodChange('Life time')}
                                        popover
                                        popover_content={
                                            'Choose this option to set the event for a life time duration.'
                                        }
                                        popover_class="mt3"
                                    ></RSRadioButton>
                                    {/* <RSTooltip position="top" text="Choose this option to set the event for a life time duration." className="lh0">
                                                <i className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5`} />
                                            </RSTooltip> */}

                                    <RSRadioButton
                                        name="periodType"
                                        id="geo_period_custom"
                                        control={control}
                                        // labelName="custom"
                                        labelName={'Date range'}
                                        isName
                                        className="ml15"
                                        radio_wrapper_class="mt0"
                                        customLabelclassName="mr5"
                                        handleChange={() => handlePeriodChange('Date range')}
                                        popover
                                        popover_content={
                                            'Choose this option to set the event for a specific date range.'
                                        }
                                        popover_class="mt3"
                                    ></RSRadioButton>
                                    {/* <RSTooltip position="top" text="Choose this option to set the event for a specific date range." className="lh0">
                                                <i className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5`} />
                                            </RSTooltip> */}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Date Range (only for custom period) */}
                    {periodType === 'Date range' && (
                        <div className="form-group">
                            <Row>
                                <Col sm={3} className="text-right">
                                    <label className="control-label-left">Date range</label>
                                </Col>
                                <Col sm={8} className="pr45">
                                    <Row>
                                        <Col md={6}>
                                            <RSDatePicker
                                                key={`startDate-${startDate?.getTime() || 'empty'}`}
                                                required
                                                name="startDate"
                                                control={control}
                                                min={new Date()}
                                                format={FORMAT_DATE}
                                                rules={{ required: SELECT_START_DATE }}
                                                placeholder={START_DATE}
                                                handleChange={handleStartDateChange}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <RSDatePicker
                                                key={`endDate-${endDate?.getTime() || 'empty'}`}
                                                required
                                                name="endDate"
                                                control={control}
                                                min={endMinValue || new Date()}
                                                max={endMaxValue || null}
                                                format={FORMAT_DATE}
                                                rules={{ required: SELECT_END_DATE }}
                                                placeholder={END_DATE}
                                                disabled={!startDate}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Regions Section */}
                    <div className="rs-sub-heading mb15">
                        <div className="align-items-center d-flex justify-content-between">
                            <h4 className="mb0">Regions</h4>
                            <div className="d-flex align-items-center">
                                {/* <RSTooltip position="top" text={VIEW_REGION_MAP} className="lh0 mr10">
                                    <i
                                        onClick={handleMapModalOpen}
                                        className={`icon-md ${isFormValid && regions.length > 0 ? 'color-primary-blue icon-hover-shadow-primary' : 'color-gray'} ${isFormValid && regions.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed'} ${map_medium}`}
                                        id="rs_region_map_button"
                                    />
                                    ${isFormValid ? 'cursor-pointer' : 'cursor-not-allowed'} 
                                </RSTooltip> */}
                                <RSTooltip position="top" text={UPLOAD_REGION_FILE} className="mr15 lh0">
                                    <i
                                        onClick={() => {
                                            setRegionError(''); // Clear any previous errors
                                            setShowUploadModal(true);
                                            return;
                                        }}
                                        className={`icon-lg color-primary-blue ${builder_upload_large}`}
                                        id="rs_region_upload_button"
                                    />
                                </RSTooltip>
                                <RSTooltip position="top" className="lh0 mr15" text={DOWNLOAD_SAMPLE}>
                                    <i
                                        onClick={handleDownloadSample}
                                        className={`icon-lg color-primary-blue ${csv_download_large} cursor-pointer`}
                                        id="rs_download_sample_files_button"
                                    />
                                </RSTooltip>
                                <RSTooltip position="top" text={ADD || 'Add'} className="lh0">
                                    <i
                                        className={`icon-lg color-primary-blue  ${circle_plus_fill_large}`}
                                        onClick={() => setShowAddRegion(true)}
                                    />
                                </RSTooltip>
                            </div>
                        </div>
                        {regionError && (
                            <div className="alert alert-warning align-items-stretch border-r7 mt19 d-flex">
                                <i
                                    className={`${alert_medium} icon-md bg-orange-medium mr5 position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center`}
                                />
                                <span className="align-items-center d-flex py5">{regionError}</span>
                                <RSTooltip text={'Close'} className="position-absolute right5  top5 lh0">
                                    <i
                                        className={`${circle_close_mini} icon-xs cursor-pointer color-orange-medium`}
                                        onClick={() => setRegionError('')}
                                    />
                                </RSTooltip>
                            </div>
                        )}
                    </div>

                    {/* Regions Grid/Empty State */}
                    <div className={`Geofencing_grid_wrapper${isEditDetailsLoading ? ' pe-none click-off' : ''}`}>
                        {/* {regions?.length === 0 ? (
                            <RSSkeletonTable
                                text
                                count={5}
                                isCustombox
                                isAlertIcon={false}
                                message="No regions added yet. Click Add Region to get started."
                            />
                        ) : ( */}

                        <RegionGrid
                            regions={regions}
                            onEdit={(index) => {
                                setEditIndex(index);
                                setShowAddRegion(true);
                            }}
                            onDelete={(deleteIndex) => {
                                let temp = [...deleteRegion];
                                let _tempRegions = [...regions];

                                temp.push(_tempRegions[deleteIndex]);
                                setDeleteRegion(temp);
                                _tempRegions.splice(deleteIndex, 1);
                                setRegions(_tempRegions);
                                // handleDeleteRegion(deleteIndex)
                            }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="buttons-holder pref-cs-buttons-outside">
                        <RSSecondaryButton type="button" onClick={() => onCancel()} id="rs_GeofencingCreate_Cancel">
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton type="submit" id="rs_GeofencingCreate_Save">
                            {geoFenceId > 0 ? 'Update' : 'Add'}
                        </RSPrimaryButton>
                    </div>
                </form>
            </FormProvider>
            </CommunicationSettingsEditSkeletonGate>
            {formActions}
        </>
    );
};

GeofencingCreate.propTypes = {
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    geoFenceId: PropTypes.number,
};

/**
 * Helper component to fetch and populate geofence details when editing
 */
const LoadGeoFenceDetails = ({
    geoFenceId,
    departmentId,
    clientId,
    userId,
    setRegions,
    setValue,
    reset,
    setOriginalClusterName,
    setIsEditDetailsLoading,
}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        let cancelled = false;

        const fetchDetails = async () => {
            setIsEditDetailsLoading(true);
            try {
                const res = await dispatch(getGeoFenceDetailsById({ geoFenceId, departmentId, clientId, userId }));
                if (cancelled) return;

                const details = res?.data?.data ?? res?.data;
                if (!res?.status || !details) return;

                // Parse dates properly - handle both string and Date formats
                // Extract only date part (year, month, day) to avoid timezone issues
                const parseDate = (dateValue) => {
                    if (!dateValue) return null;
                    if (dateValue instanceof Date) {
                        // Extract date components to avoid timezone shifts
                        return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
                    }
                    if (typeof dateValue === 'string') {
                        const parsed = new Date(dateValue);
                        if (isNaN(parsed.getTime())) return null;
                        // Use UTC methods to extract date components from the original date string
                        // This preserves the date as it appears in the API response (e.g., "29 Dec 2025")
                        // regardless of timezone conversion
                        const year = parsed.getUTCFullYear();
                        const month = parsed.getUTCMonth();
                        const day = parsed.getUTCDate();
                        // Create a new date in local timezone with the extracted UTC date components
                        // This ensures the date picker shows the correct date (e.g., Dec 29, not Dec 30)
                        return new Date(year, month, day);
                    }
                    return null;
                };

                const clusterName = details?.identifier || '';
                setOriginalClusterName(clusterName);

                // Prepare form values
                let formValues = {
                    clusterName: clusterName,
                    mobileApp: null,
                    periodType: details?.isAllTime ? 'Life time' : 'Date range',
                    startDate: null,
                    endDate: null,
                    endMinValue: null,
                    endMaxValue: null,
                };

                // Set period type and dates
                if (!details?.isAllTime) {
                    const startDateParsed = parseDate(details?.startDate);
                    const endDateParsed = parseDate(details?.endDate);

                    formValues.startDate = startDateParsed;
                    formValues.endDate = endDateParsed;

                    // Set min/max for end date if start date exists
                    if (startDateParsed) {
                        const minEndDate = new Date(startDateParsed);
                        minEndDate.setDate(startDateParsed.getDate() + MIN_DAYS_RANGE);

                        const maxEndDate = new Date(startDateParsed);
                        maxEndDate.setDate(startDateParsed.getDate() + MAX_DAYS_RANGE);

                        formValues.endMinValue = minEndDate;
                        formValues.endMaxValue = maxEndDate;
                    }
                }

                // Set mobile apps (array)
                if (Array.isArray(details?.appList) && details.appList.length > 0) {
                    formValues.mobileApp = details.appList.map((app) => ({
                        appGuid: app.appId,
                        appName: app.appName,
                    }));
                } else {
                    formValues.mobileApp = [];
                }

                // Reset form with all values at once to ensure proper update
                reset(formValues);

                // Map regions from API to UI model
                const mappedRegions = Array.isArray(details?.cluster)
                    ? details.cluster.map((r) => ({
                          placeName: r?.placeName || '',
                          latitude: r?.latitude || '',
                          longitude: r?.longitude || '',
                          radius: r?.radius || '',
                          regionId: r?.regionId,
                          customDataEnabled: Array.isArray(r?.jsonData) && r.jsonData.length > 0,
                          customData: Array.isArray(r?.jsonData)
                              ? r.jsonData.map((j) => ({
                                    key:
                                        typeof j?.eventName === 'string' && j.eventName.startsWith('[[')
                                            ? { id: null, value: j.eventName }
                                            : j?.eventName || '',
                                    value: j?.eventValue || '',
                                    isDropdown: typeof j?.eventName === 'string' && j.eventName.startsWith('[['),
                                }))
                              : [],
                      }))
                    : [];

                setRegions(mappedRegions);
            } finally {
                if (!cancelled) setIsEditDetailsLoading(false);
            }
        };

        fetchDetails();
        return () => {
            cancelled = true;
        };
    }, [
        dispatch,
        geoFenceId,
        departmentId,
        clientId,
        userId,
        setRegions,
        reset,
        setOriginalClusterName,
        setIsEditDetailsLoading,
    ]);

    return null;
};

LoadGeoFenceDetails.propTypes = {
    geoFenceId: PropTypes.number.isRequired,
    departmentId: PropTypes.number,
    clientId: PropTypes.number,
    userId: PropTypes.number,
    setRegions: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    setOriginalClusterName: PropTypes.func.isRequired,
    setIsEditDetailsLoading: PropTypes.func.isRequired,
};

export default GeofencingCreate;
