import { builder_upload_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { validateFCMCredentials } from 'Utils/fcmValidator';
import { validateFirebaseServiceAccountJson } from 'Utils/firebaseServiceAccountJson';
import './FirebaseJSONUploadModal.scss';
import RSModal from 'Components/RSModal';
import { useDispatch } from 'react-redux';
import { getConfigDetails } from 'Reducers/preferences/CommunicationSettings/request';

const FirebaseJSONUploadModal = ({ show, onHide, onFileUpload, currentFile, type, uploadBootstrap = null }) => {
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState(currentFile || '');
    const [isTestingFCM, setIsTestingFCM] = useState(false);
    const [fcmTestResult, setFcmTestResult] = useState(null);
    const [configDetails, setConfigDetails] = useState(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const fileInputRef = useRef(null);

    const validateFirebaseJSON = validateFirebaseServiceAccountJson;

    // Test FCM credentials using native REST APIs (no libraries!)
    const testFCMCredentials = async (serviceAccount) => {
        try {
            setIsTestingFCM(true);
            setFcmTestResult(null);
            setError('');

            const result = await validateFCMCredentials(serviceAccount);

            setFcmTestResult({
                success: result.success,
                message: result.message,
                data: result?.data
            });

            return result.success;
        } catch (err) {
            setFcmTestResult({
                success: false,
                message: err.message || 'Failed to test FCM credentials'
            });
            return false;
        } finally {
            setIsTestingFCM(false);
        }
    };

    // Handle file selection
    const handleFileChange = (selectedFile) => {
        setError('');

        if (!selectedFile) {
            return;
        }

        // Check file type
        if (!selectedFile.name.endsWith('.json')) {
            setError('Only .json files are supported');
            return;
        }

        // Check file size (500KB max)
        if (selectedFile.size > 500000) {
            setError('File size must be less than 500KB');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            const validation = validateFirebaseJSON(content);

            if (!validation.valid) {
                setError(validation.error);
                setFile(null);
                setFileName('');
                return;
            }

            // Convert to base64
            const base64Content = btoa(content);
            const base64WithPrefix = `data:application/json;base64,${base64Content}`;

            setFile({
                name: selectedFile.name,
                content: base64WithPrefix,
                jsonData: validation.data
            });
            setFileName(selectedFile.name);

            // Automatically test FCM credentials
            testFCMCredentials(validation.data);
        };

        reader.onerror = () => {
            setError('Error reading file. Please try again.');
        };

        reader.readAsText(selectedFile);
    };

    // Handle drag events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileChange(droppedFiles[0]);
        }
    };

    // Handle file input click
    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    // Extract base64 content from file content (remove data:application/json;base64, prefix)
    const extractBase64Content = (content) => {
        if (!content) return '';
        // Check if content has the data URL prefix
        if (content.includes('data:application/json;base64,')) {
            return content.split('data:application/json;base64,')[1];
        }
        // If it's already base64, return as is
        return content;
    };

    // Call GetConfigDetails API for web type
    const fetchConfigDetails = async (base64Content) => {
        try {
            setIsLoadingConfig(true);
            setError('');
            const result = await dispatch(getConfigDetails({ jsonPath: base64Content }));
            
            if (result?.status) {
                setConfigDetails(result?.data);
            } else {
                setError(result?.message || 'Failed to fetch config details');
                setConfigDetails(null);
            }
        } catch (err) {
            setError('Error fetching config details. Please try again.');
            setConfigDetails(null);
        } finally {
            setIsLoadingConfig(false);
        }
    };

    // Handle upload
    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        // Warn if FCM test failed
        if (fcmTestResult && !fcmTestResult.success) {
            const proceed = window.confirm(
                'FCM credentials test failed. The credentials may not have proper Firebase Cloud Messaging permissions. Do you want to proceed anyway?'
            );
            if (!proceed) {
                return;
            }
        }

        // If type is 'web', call GetConfigDetails API
        if (type === 'web') {
            const base64Content = extractBase64Content(file.content);
            await fetchConfigDetails(base64Content);
            // Don't close modal yet, wait for user to select an app
            return;
        }

        // For non-web types, proceed with normal upload
        onFileUpload({
            fileName: file.name,
            content: file.content,
            jsonData: file.jsonData,
            fcmTestPassed: fcmTestResult?.success || false
        });

        handleClose();
    };

    // Handle app selection
    const handleSelectApp = (app) => {
        setSelectedApp(app);
        onFileUpload({
            fileName: file.name,
            content: file.content,
            jsonData: file.jsonData,
            fcmTestPassed: fcmTestResult?.success || false,
            selectedApp: app,
            configDetails: configDetails
        });
        handleClose();
    };

    // Handle modal close
    const handleClose = () => {
        setFile(null);
        setError('');
        setIsDragging(false);
        setFileName(currentFile || '');
        setIsTestingFCM(false);
        setFcmTestResult(null);
        setConfigDetails(null);
        setIsLoadingConfig(false);
        setSelectedApp(null);
        onHide();
    };

    // Retry FCM test
    const handleRetryTest = () => {
        if (file?.jsonData) {
            testFCMCredentials(file.jsonData);
        }
    };

    useEffect(() => {
        if (!show) {
            return;
        }
        if (uploadBootstrap) {
            setFile({
                name: uploadBootstrap.fileName,
                content: uploadBootstrap.content,
                jsonData: uploadBootstrap.jsonData,
            });
            setFileName(uploadBootstrap.fileName || '');
            setConfigDetails(uploadBootstrap.configDetails || null);
            setError('');
            setIsDragging(false);
            setIsTestingFCM(false);
            setFcmTestResult(null);
            setIsLoadingConfig(false);
            setSelectedApp(null);
            if (uploadBootstrap.jsonData) {
                testFCMCredentials(uploadBootstrap.jsonData);
            }
            return;
        }
        setFile(null);
        setError('');
        setIsDragging(false);
        setFileName('');
        setIsTestingFCM(false);
        setFcmTestResult(null);
        setConfigDetails(null);
        setIsLoadingConfig(false);
        setSelectedApp(null);
    }, [show, uploadBootstrap]);

    return <RSModal
        show={show}
        header={"Upload service account JSON file"}
        isBorder={true}
        size={configDetails ? "xl" : "xl"}
        handleClose={handleClose}
        body={
        <div className="firebase-json-upload-modal">
            {fileName && !error && (
                <div className="selected-file mb10">
                    <div className="file-info">
                        <i className="icon icon-file-text mr10"></i>
                        <span className="file-name">{fileName}</span>
                        <i
                            className="icon icon-check-circle color-success ml10"
                            title="Valid Firebase service account JSON"
                        ></i>
                    </div>
                </div>
            )}
            {!uploadBootstrap && (
                <div
                    className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        style={{ display: 'none' }}
                    />

                    <div className="upload-content">
                        <i className={`${builder_upload_large} icon-xxlg text-primary`} />
                        <h4 className="mb5">Drag & Drop your file here</h4>
                        <p className="text-muted mb5">or</p>
                        <RSSecondaryButton type="button" onClick={handleBrowseClick}>
                            Browse Files
                        </RSSecondaryButton>
                        <p className="text-muted mt0 mb10">
                            <small>Only .json files are supported (Max size: 500KB)</small>
                        </p>
                    </div>
                </div>
            )}



            {error && (
                <div className="alert alert-danger mt20" role="alert">
                    <i className="icon icon-alert-circle mr10"></i>
                    {error}
                </div>
            )}

            {/* FCM Testing Status */}
            {isTestingFCM && (
                <div className="alert alert-info mt20 testing-alert" role="alert">
                    <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm mr10" role="status">

                        </div>

                    </div>
                </div>
            )}

            {/* FCM Test Result */}
            {fcmTestResult && !isTestingFCM && (
                <div
                    className={`alert ${fcmTestResult.success ? 'alert-success' : 'alert-warning'} mt20 toast-message`}
                    role="alert"
                    style={{
                        animation: 'fadeOut 0.5s ease-in-out 2.5s forwards'
                    }}
                >
                    <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex align-items-start flex-grow-1">
                            <i className={`icon ${fcmTestResult.success ? 'icon-check-circle' : 'icon-alert-triangle'} mr10`}></i>
                            <div>
                                <strong>{fcmTestResult.success ? 'Success!' : 'Warning'}</strong>
                                <p className="mb0 mt5">{fcmTestResult.success ? 'Valid json file' : fcmTestResult.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Config Details */}
            {isLoadingConfig && (
                <div className="alert alert-info mt20" role="alert">
                    <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm mr10" role="status"></div>
                        <span>Fetching app configurations...</span>
                    </div>
                </div>
            )}

            {/* Config Details - App Cards */}
            {configDetails && configDetails.configurations && configDetails.configurations.length > 0 && (
                <div className="mt20">
                    <h5 className="mb15">Available Web Apps</h5>
                    {configDetails.message && (
                        <div className="alert alert-info mb15">
                            <small>{configDetails.message}</small>
                        </div>
                    )}
                    <div className="app-cards-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Row>
                            {configDetails.configurations.map((app, index) => (
                                <Col sm={12} key={app.appId || index} className="mb15">
                                    <div className="card" style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px' }}>
                                        <div className="d-flex justify-content-between align-items-start mb10">
                                            <div>
                                                <h6 className="mb5">{app.appName || app.appId}</h6>
                                                <small className="text-muted">App ID: {app.appId}</small>
                                            </div>
                                            {app.hasVapidKey ? (
                                                <span className="badge bg-success">VAPID Key Available</span>
                                            ) : (
                                                <span className="badge bg-warning">No VAPID Key</span>
                                            )}
                                        </div>
                                        {app.config && (
                                            <div className="mt10">
                                                <small className="text-muted d-block">Project ID: {app.config.projectId}</small>
                                                <small className="text-muted d-block">API Key: {app.config.apiKey?.substring(0, 20)}...</small>
                                                <small className="text-muted d-block">Auth Domain: {app.config.authDomain}</small>
                                            </div>
                                        )}
                                        <div className="mt15">
                                            <RSPrimaryButton
                                                type="button"
                                                size="sm"
                                                onClick={() => handleSelectApp(app)}
                                                disabled={selectedApp?.appId === app.appId}
                                            >
                                                {selectedApp?.appId === app.appId ? 'Selected' : 'Select'}
                                            </RSPrimaryButton>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                    {configDetails.instructions && (
                        <div className="alert alert-warning mt15">
                            <strong>Instructions:</strong>
                            <p className="mb5">{configDetails.instructions.message}</p>
                            {configDetails.instructions.steps && (
                                <ol className="mb0 pl20">
                                    {configDetails.instructions.steps.map((step, idx) => (
                                        <li key={idx}><small>{step}</small></li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>}
        isCloseButton={true}
        isHeaderTitle={true}
        footer={
            <>
                <RSSecondaryButton type="button" onClick={handleClose}>
                    {type === 'web' && configDetails ? 'Cancel' : 'Cancel'}
                </RSSecondaryButton>
                {type === 'web' && configDetails ? (
                    <RSPrimaryButton
                        type="button"
                        onClick={handleClose}
                    >
                        Close
                    </RSPrimaryButton>
                ) : (
                    <RSPrimaryButton
                        disabledClass={`${fcmTestResult?.success === false && !isTestingFCM ? 'pe-none click-off' : ''} ${fileName?.length === 0 ? 'pe-none click-off' : ''}`}
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || !!error || isTestingFCM || isLoadingConfig}
                    >
                        {isTestingFCM ? 'Validation...' : isLoadingConfig ? 'Loading...' : 'Upload'}
                    </RSPrimaryButton>
                )}
            </>

        }
    />


};

export default FirebaseJSONUploadModal;

