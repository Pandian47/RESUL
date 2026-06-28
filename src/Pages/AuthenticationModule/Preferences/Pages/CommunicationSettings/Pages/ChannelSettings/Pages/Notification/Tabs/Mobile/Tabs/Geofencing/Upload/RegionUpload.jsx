import { DOWNLOAD_SAMPLE, UPLOAD_REGION_FILE } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_tick_medium, csv_download_medium, loading_mini, upload_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { checkValidGeoFence } from 'Reducers/preferences/CommunicationSettings/Geofencing/request';
import ResDDCustomUpload from 'Pages/KendoDocs/CommonComponents/ResDDCustomUpload';
import RSTooltip from 'Components/RSTooltip';
const MAX_REGIONS = 50;
/** Inline success / error banner clears after this many ms */
const ALERT_AUTO_DISMISS_MS = 5000;

const FILE_FORMAT_ROWS = [
    {
        id: 'headers',
        label: 'First row should contain headers',
        value: 'placeName, latitude, longitude, radius, jsonData',
    },
    { id: 'placeName', label: 'placeName', value: 'Text name for the region' },
    { id: 'latitude', label: 'latitude', value: '-90 to 90 (decimal degrees)' },
    { id: 'longitude', label: 'longitude', value: '-180 to 180 (decimal degrees)' },
    { id: 'radius', label: 'radius', value: 'Positive number in meters (minimum 100m)' },
    { id: 'jsonData', label: 'jsonData', value: 'Optional JSON array for custom data' },
];

const RegionUpload = ({
    show,
    handleClose,
    onUpload,
    onValidationError,
    // Props for API validation
    geoFenceId = 0,
    clusterName = '',
    dateInfo = { startDate: null, endDate: null, isAllTime: true },
    mobileApp = null,
    existingRegions = []
}) => {
    const dispatch = useDispatch();
    const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const alertDismissTimerRef = useRef(null);

    // Reset values when modal is shown
    useEffect(() => {
        if (show) {
            setSelectedFile(null);
            setError('');
            setSuccess('');
            setUploading(false);
        }
    }, [show]);

    useEffect(() => {
        if (!success && !error) {
            return undefined;
        }
        if (alertDismissTimerRef.current) {
            clearTimeout(alertDismissTimerRef.current);
        }
        alertDismissTimerRef.current = setTimeout(() => {
            alertDismissTimerRef.current = null;
            setSuccess('');
            setError('');
        }, ALERT_AUTO_DISMISS_MS);
        return () => {
            if (alertDismissTimerRef.current) {
                clearTimeout(alertDismissTimerRef.current);
                alertDismissTimerRef.current = null;
            }
        };
    }, [success, error]);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return undefined;
        }
        const mq = window.matchMedia('(max-width: 575.98px)');
        const onChange = () => setIsMobileFullscreen(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const handleFileSelect = (file) => {
        if (file) {
            setSelectedFile(file);
            setError('');
            setSuccess('');
            parseFileContent(file);
        }
    };

    const parseFileContent = async (file) => {
        return new Promise(async (resolve, reject) => {
            // Check if file is Excel format
            const isExcel = file.type === 'application/vnd.ms-excel' ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.name.endsWith('.xls') ||
                file.name.endsWith('.xlsx');

            if (isExcel) {
                // Handle Excel files using XLSX library (dynamic import)
                // Try to dynamically import xlsx, but handle gracefully if not available
                let XLSX;
                try {
                    // Use dynamic import with error handling
                    const XLSXModule = await import('xlsx').catch(() => null);
                    if (!XLSXModule) {
                        throw new Error('xlsx library not found');
                    }
                    XLSX = XLSXModule.default || XLSXModule;
                } catch (importError) {
                      setError('Excel file support requires the xlsx library. Please install it using: npm install xlsx (or yarn add xlsx). Alternatively, save your Excel file as CSV format and upload it.');
                    reject(new Error('Excel file support requires the xlsx library. Please install it using: npm install xlsx (or yarn add xlsx). Alternatively, save your Excel file as CSV format and upload it.'));
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });

                        // Get the first sheet
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        // Convert to JSON array
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                        if (jsonData.length < 2) {
                              setError('File must contain at least a header row and one data row');
                            reject(new Error('File must contain at least a header row and one data row'));
                            return;
                        }

                        // Get headers from first row
                        const headers = jsonData[0].map(h => String(h || '').trim().toLowerCase());

                        // Required headers: placename, latitude, longitude, radius
                        // Optional headers: jsondata (not validated)
                        const expectedHeaders = ['placename', 'latitude', 'longitude', 'radius'];
                        const hasValidHeaders = expectedHeaders.every(header =>
                            headers.some(h => h.includes(header))
                        );

                        if (!hasValidHeaders) {
                              setError('Invalid file format. Required headers: placeName, latitude, longitude, radius. jsonData is optional.');
                            reject(new Error('Invalid file format. Required headers: placeName, latitude, longitude, radius. jsonData is optional.'));
                            return;
                        }

                        // Find column indices
                        const placeNameIndex = headers.findIndex(h => h.includes('placename'));
                        const latitudeIndex = headers.findIndex(h => h.includes('latitude'));
                        const longitudeIndex = headers.findIndex(h => h.includes('longitude'));
                        const radiusIndex = headers.findIndex(h => h.includes('radius'));
                        const jsonDataIndex = headers.findIndex(h => h.includes('jsondata') || h.includes('json_data'));

                        const regions = [];
                        for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            const placeName = String(row[placeNameIndex] || '').trim();
                            const latitude = String(row[latitudeIndex] || '').trim();
                            const longitude = String(row[longitudeIndex] || '').trim();
                            const radius = String(row[radiusIndex] || '').trim();

                            if (placeName && latitude && longitude && radius) {
                                // Parse jsonData if present (optional - no validation required)
                                let jsonDataArray = [];
                                if (jsonDataIndex !== -1 && row[jsonDataIndex] !== undefined) {
                                    const jsonDataValue = String(row[jsonDataIndex] || '').trim();
                                    if (jsonDataValue && jsonDataValue !== '') {
                                        try {
                                            const parsed = typeof jsonDataValue === 'string' ? JSON.parse(jsonDataValue) : jsonDataValue;
                                            // Only use if it's a valid array
                                            if (Array.isArray(parsed)) {
                                                jsonDataArray = parsed;
                                            }
                                        } catch (e) {
                                            // Silently ignore invalid jsonData - it's optional
                                            jsonDataArray = [];
                                        }
                                    }
                                }

                                regions.push({
                                    placeName: placeName,
                                    latitude: latitude,
                                    longitude: longitude,
                                    radius: radius,
                                    radiusType: '',
                                    jsonData: jsonDataArray // Always an array, empty if not provided or invalid
                                });
                            }
                        }

                        if (regions.length === 0) {
                            setError('No valid regions found in the file');
                            reject(new Error('No valid regions found in the file'));
                            return;
                        }

                        setError('');
                        setSuccess('Uploaded successfully');
                        resolve(regions);
                    } catch (error) {
                        setError('Failed to parse Excel file: ' + error.message);
                        reject(new Error('Failed to parse Excel file: ' + error.message));
                    }
                };
                reader.onerror = () => {
                    setError('Failed to read Excel file');
                    reject(new Error('Failed to read Excel file'));
                };
                reader.readAsArrayBuffer(file);
                return;
            }

            // Handle CSV files
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;

                    // Check if the text looks like binary data (Excel file read as text)
                    if (text.includes('\0') || (text.length > 0 && text.charCodeAt(0) === 0x50 && text.charCodeAt(1) === 0x4B)) {
                          setError('Excel file format (.xls/.xlsx) detected. Please save your file as CSV format and try again, or use a tool to convert Excel to CSV.');
                        reject(new Error('Excel file format (.xls/.xlsx) detected. Please save your file as CSV format and try again, or use a tool to convert Excel to CSV.'));
                        return;
                    }

                    const lines = text.split(/\r?\n/).filter(line => line.trim());

                    if (lines.length < 2) {
                        setError('File must contain at least a header row and one data row');
                        reject(new Error('File must contain at least a header row and one data row'));
                        return;
                    }

                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                    // Required headers: placename, latitude, longitude, radius
                    // Optional headers: jsondata (not validated)
                    const expectedHeaders = ['placename', 'latitude', 'longitude', 'radius'];
                    const hasValidHeaders = expectedHeaders.every(header =>
                        headers.some(h => h.includes(header))
                    );

                    if (!hasValidHeaders) {
                        setError('Invalid file format. Required headers: placeName, latitude, longitude, radius. jsonData is optional.');
                        reject(new Error('Invalid file format. Required headers: placeName, latitude, longitude, radius. jsonData is optional.'));
                        return;
                    }

                    // Find jsonData column index if it exists (optional)
                    const jsonDataIndex = headers.findIndex(h => h.includes('jsondata') || h.includes('json_data'));

                    const regions = [];
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i];
                        if (!line.trim()) continue;

                        // Parse CSV line handling quoted values
                        const values = [];
                        let current = '';
                        let inQuotes = false;

                        for (let j = 0; j < line.length; j++) {
                            const char = line[j];
                            if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                values.push(current.trim());
                                current = '';
                            } else {
                                current += char;
                            }
                        }
                        values.push(current.trim());

                        if (values.length >= 4 && values[0] && values[1] && values[2] && values[3]) {
                            // Parse jsonData if present (optional - no validation required)
                            let jsonData = [];
                            // Check if jsonData column exists and has a value
                            if (jsonDataIndex !== -1 && values[jsonDataIndex] !== undefined) {
                                const jsonDataValue = values[jsonDataIndex];
                                // Only parse if value exists and is not empty
                                if (jsonDataValue && jsonDataValue.trim() !== '' && jsonDataValue !== '""') {
                                    try {
                                        const parsed = JSON.parse(jsonDataValue);
                                        // Only use if it's a valid array
                                        if (Array.isArray(parsed)) {
                                            jsonData = parsed;
                                        }
                                    } catch (e) {
                                        // Silently ignore invalid jsonData - it's optional
                                        // Don't log warning as jsonData is optional
                                        jsonData = [];
                                    }
                                }
                            }

                            regions.push({
                                placeName: values[0],
                                latitude: values[1],
                                longitude: values[2],
                                radius: values[3],
                                radiusType: '',
                                jsonData: jsonData // Always an array, empty if not provided or invalid
                            });
                        }
                    }

                    if (regions.length === 0) {
                         setError('No valid regions found in the file');
                        reject(new Error('No valid regions found in the file'));
                        return;
                    }

                    setError('');
                    setSuccess('Uploaded successfully');
                    resolve(regions);
                } catch (error) {
                    setError('Failed to parse file content: ' + error.message);
                    reject(new Error('Failed to parse file content: ' + error.message));
                }
            };
            reader.onerror = () => {
                  setError('Failed to read file');
                  reject(new Error('Failed to read file'));
            } 
            reader.readAsText(file);
        });
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        // Validate parent form fields
        // if (!clusterName || !clusterName.trim()) {
        //     setError('Please enter cluster name in the main form before uploading regions.');
        //     return;
        // }

        // if (!mobileApp || !mobileApp.appGuid) {
        //     setError('Please select a mobile app in the main form before uploading regions.');
        //     return;
        // }

        // // Validate date range for custom period
        // if (!dateInfo.isAllTime && (!dateInfo.startDate || !dateInfo.endDate)) {
        //     setError('Please select start and end dates in the main form for custom period.');
        //     return;
        // }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            // Parse the uploaded file
            const uploadedRegions = await parseFileContent(selectedFile);

            if (uploadedRegions.length === 0) {
                setError('No valid regions found in the file.');
                setUploading(false);
                return;
            }

            // Check if total regions would exceed the limit
            const currentRegionCount = Array.isArray(existingRegions) ? existingRegions.length : 0;
            const totalRegions = currentRegionCount + uploadedRegions.length;

            if (totalRegions > MAX_REGIONS) {
                const availableSlots = MAX_REGIONS - currentRegionCount;
                setError(`Cannot upload ${uploadedRegions.length} regions. Maximum allowed is ${MAX_REGIONS} regions. You currently have ${currentRegionCount} region(s). You can only add ${availableSlots} more region(s).`);
                setUploading(false);
                return;
            }

            // Merge with existing regions
            const allRegions = [...existingRegions, ...uploadedRegions];

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
                // Validation successful - add regions to grid
                setSuccess(`${uploadedRegions.length} regions uploaded successfully!`);
                onUpload && onUpload(uploadedRegions);

                setTimeout(() => {
                    setSuccess(''); // Clear success message after 3 seconds
                    handleClose();
                }, 3000);
            } else {
                // Validation failed - show error in parent component
                const errorMsg = response?.message || 'Validation failed. Please check your file data.';
                onValidationError && onValidationError(errorMsg);
                setError(errorMsg);
            }
        } catch (err) {
            setError(err.message || 'Failed to upload regions. Please check your file format.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadSample = () => {
        const files = ['sample_cluster.csv', 'sample_cluster.xlsx'];

        files.forEach((fileName, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = `/documents/${fileName}`;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 500); // 500ms delay between downloads
        });
    };

    const handleCloseModal = () => {
        setSelectedFile(null);
        setError('');
        setSuccess('');
        setUploading(false);
        handleClose();
    };

    return (
        <RSModal
            show={show}
            size="lg"
            className="region-upload-modal"
            bodyClassName="region-upload-body css-scrollbar"
            footerClassName="region-upload-footer"
            fullscreen={isMobileFullscreen}
            header={UPLOAD_REGION_FILE}
            handleClose={handleCloseModal}
            isCloseButton={true}
            body={
                <div className="region-upload">
                    {/* <div className="region-upload__section region-upload__section--download">
                        <div className="region-upload__section-head">
                            <h3 className="region-upload__heading">Download sample files</h3>
                            <RSTooltip text="Download sample files (CSV & Excel)" className="lh0">
                                <button
                                    type="button"
                                    className="region-upload__icon-btn"
                                    onClick={handleDownloadSample}
                                    aria-label="Download sample CSV and Excel files"
                                >
                                    <i className={`${csv_download_medium} color-primary-blue icon-md`} />
                                </button>
                            </RSTooltip>
                        </div>
                        <p className="region-upload__text">
                            Download the sample CSV or Excel files to understand the required format for uploading
                            regions.
                        </p>
                    </div> */}

                        {(success || error) && (
                            <div
                                className={`region-upload__alert alert align-items-stretch border-r7 m0 ${success && !error ? 'alert-success' : 'alert-warning'
                                    }`}
                                role="status"
                            >
                                <i
                                    className={`position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${success && !error ? circle_tick_medium : alert_medium
                                        } ${success && !error ? 'bg-green-medium' : 'bg-orange-medium'} icon-md`}
                                />
                                <span className="align-items-center d-flex py5">{error || success}</span>
                            </div>
                        )}

                    <div className="region-upload__section region-upload__section--upload">
                        {/* <h3 className="region-upload__heading">Upload region file</h3> */}
                        <p className="region-upload__text region-upload__text--spaced lh-sm">
                            Select a CSV or Excel file containing region data. The file should include columns for
                            placeName, latitude, longitude, radius, and jsonData (optional).
                        </p>

                        <ResDDCustomUpload
                            inputId="regionUploadInput"
                            accept=".csv,.xls,.xlsx"
                            acceptedFormats={[
                                'text/csv',
                                'application/vnd.ms-excel',
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            ]}
                            supportedFormatsLabel=".csv, .xls, .xlsx"
                            invalidTypeMessage="Supported formats: .csv, .xls, .xlsx"
                            maxSize={5 * 1024 * 1024}
                            isMultiFileUpload={false}
                            isShowUrl={false}
                            selectedFile={selectedFile}
                            disabled={uploading}
                            isProcessing={uploading}
                            onFileSelect={(file, { isValid } = {}) => {
                                if (isValid) handleFileSelect(file);
                            }}
                            onClear={() => {
                                setSelectedFile(null);
                                setError('');
                                setSuccess('');
                            }}
                        />
                        {!selectedFile && (
                            <RSTooltip text={DOWNLOAD_SAMPLE} className="lh0 float-end mt5">
                                <button
                                    type="button"
                                    className="region-upload__icon-btn"
                                    onClick={handleDownloadSample}
                                    aria-label="Download sample CSV and Excel files"
                                >
                                    <i className={`${csv_download_medium} color-primary-blue icon-md`} />
                                </button>
                            </RSTooltip>
                        )}
                    </div>

                    <aside
                        className="region-upload__format"
                        aria-labelledby="region-upload-format-title"
                    >
                        <h3 id="region-upload-format-title" className="region-upload__format-title">
                            File format requirements:
                        </h3>
                        <ul className="region-upload__format-list">
                            {FILE_FORMAT_ROWS.map((row) => (
                                <li key={row.id} className="region-upload__format-bullet">
                                    <span className="region-upload__format-label">{row.label}</span>
                                    {': '}
                                    <span className="region-upload__format-value">{row.value}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>
            }
            footer={
                <div className="region-upload__footer-actions">
                    <RSSecondaryButton onClick={handleCloseModal} disabled={uploading}>
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? (
                            <>
                                <i className={`${loading_mini} mr5`} />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <i className={`${upload_mini} mr5`} />
                                Upload regions
                            </>
                        )}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default RegionUpload;
