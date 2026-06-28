import { useEffect, useRef, useState } from 'react';
import { RSSecondaryButton } from 'Components/Buttons';
import { validateFCMCredentials } from 'Utils/fcmValidator';
import './FirebaseJSONUploadModal.scss';

const NewFirebaseServiceAccount = ({ show, onHide, onFileUpload, currentFile }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState(currentFile || '');
    const [isTestingFCM, setIsTestingFCM] = useState(false);
    const [fcmTestResult, setFcmTestResult] = useState(null);
    const fileInputRef = useRef(null);

    // Validate Firebase service account JSON
    const validateFirebaseJSON = (jsonContent) => {
        try {
            const parsed = JSON.parse(jsonContent);

            // Required fields for Firebase service account
            const requiredFields = [
                'type',
                'project_id',
                'private_key_id',
                'private_key',
                'client_email',
                'client_id',
                'auth_uri',
                'token_uri',
                'auth_provider_x509_cert_url',
                'client_x509_cert_url'
            ];

            const missingFields = requiredFields.filter(field => !parsed[field]);

            if (missingFields.length > 0) {
                return {
                    valid: false,
                    error: `Invalid Firebase service account JSON. Missing fields: ${missingFields.join(', ')}`
                };
            }

            if (parsed.type !== 'service_account') {
                return {
                    valid: false,
                    error: 'Invalid Firebase service account JSON. Type must be "service_account"'
                };
            }

            return {
                valid: true,
                data: parsed
            };
        } catch (err) {
            return {
                valid: false,
                error: 'Invalid JSON format. Please upload a valid Firebase service account JSON file.'
            };
        }
    };

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

    // Handle upload
    const handleUpload = () => {
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

        onFileUpload({
            fileName: file.name,
            content: file.content,
            jsonData: file.jsonData,
            fcmTestPassed: fcmTestResult?.success || false
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
        onHide();
    };

    // Retry FCM test
    const handleRetryTest = () => {
        if (file?.jsonData) {
            testFCMCredentials(file.jsonData);
        }
    };

    // Reset all states when modal opens/closes
    useEffect(() => {
        if (show) {
            // Reset everything when modal opens
            setFile(null);
            setError('');
            setIsDragging(false);
            setFileName('');
            setIsTestingFCM(false);
            setFcmTestResult(null);
        }
    }, [show]);

    let showHeader = fcmTestResult?.success === true || error === false

    return <div className="firebase-json-upload-modal" style={{display:'flex',height:150,width:'100%'}}>
        {showHeader && fileName?.length > 0 && (
            <div className="selected-file mb10" style={{height:50}}>
                <div className="file-info">
                    <i className="icon icon-file-text mr10"></i>
                    <span className="file-name">{fileName}</span>
                   <div class="rs-tooltip-wrapper lh0 ml10">
                    <i class="icon-rs-delete-medium icon-md color-primary-red" id="rs_data_delete" onClick={() => setFileName('')}>
                        </i></div>
                </div>
            </div>
        )}
        <div
            style={{width:'100%'}}
            className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}${(showHeader === true && fileName?.length > 0) && 'd-none'}`}
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

            <div className="upload-content" onClick={handleBrowseClick}>
                <i className="icon icon-upload-cloud icon-xlg color-gray-400 mb5"></i>
                <h4 className="mb5">Drag & Drop your file here</h4>
                <p className="text-muted mb5">or</p>
                <RSSecondaryButton type="button" onClick={handleBrowseClick}>
                    Browse Files
                </RSSecondaryButton>
                <p className="text-muted mt5 mb0">
                    <small>Only .json files are supported (Max size: 500KB)</small>
                </p>
            </div>
        </div>



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


    </div>


};

export default NewFirebaseServiceAccount;

