import { truncateTitle } from 'Utils/modules/displayCore';
import { IMAGE_URL, URL, Video_URL } from 'Constants/GlobalConstant/Placeholders';
import { builder_upload_large, delete_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { useWatch } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import Divider from 'Components/Divider';

import { RES_DD_CUSTOM_UPLOAD_CLASS as UPLOAD_CLASS } from '../../kendoDocsVariables';

import './resDDCustomUpload.scss';

/** @typedef {'image' | 'video' | 'gif' | 'csv' | 'zip' | 'file'} FileTypePreset */

export const FILE_TYPE_PRESETS = {
    image: {
        accept: '.png,.jpg,.jpeg,.gif,.webp',
        acceptedFormats: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
        supportedFormatsLabel: '.jpg, .jpeg, .png, .gif, .webp',
        invalidTypeMessage: 'Only image files are supported (.jpg, .jpeg, .png, .gif, .webp)',
        urlPlaceholder: IMAGE_URL,
    },
    video: {
        accept: '.mp4,.mov,.webm,.avi',
        acceptedFormats: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
        supportedFormatsLabel: '.mp4, .mov, .webm, .avi',
        invalidTypeMessage: 'Only video files are supported (.mp4, .mov, .webm, .avi)',
        urlPlaceholder: Video_URL,
    },
    gif: {
        accept: '.gif',
        acceptedFormats: ['image/gif'],
        supportedFormatsLabel: '.gif',
        invalidTypeMessage: 'Only .gif files are supported',
        urlPlaceholder: IMAGE_URL,
    },
    csv: {
        accept: '.csv',
        acceptedFormats: ['text/csv', 'application/vnd.ms-excel'],
        supportedFormatsLabel: '.csv',
        invalidTypeMessage: 'Only .csv files are supported',
        urlPlaceholder: URL,
    },
    zip: {
        accept: '.zip',
        acceptedFormats: ['application/zip', 'application/x-zip-compressed'],
        supportedFormatsLabel: '.zip',
        invalidTypeMessage: 'Only .zip files are supported',
        urlPlaceholder: URL,
    },
    file: {
        accept: '*',
        acceptedFormats: [],
        supportedFormatsLabel: 'Any file type',
        invalidTypeMessage: 'File type not supported',
        urlPlaceholder: URL,
    },
};

const parseAcceptExtensions = (acceptStr = '') =>
    acceptStr
        .split(',')
        .map((token) => token.trim().replace(/^\./, '').toLowerCase())
        .filter((token) => token && token !== '*');

const resolveUploadConfig = ({
    fileType,
    accept,
    acceptedFormats,
    supportedFormatsLabel,
    invalidTypeMessage,
    urlPlaceholder,
}) => {
    const preset = fileType ? FILE_TYPE_PRESETS[fileType] : null;

    return {
        accept: accept ?? preset?.accept ?? FILE_TYPE_PRESETS.image.accept,
        acceptedFormats: acceptedFormats ?? preset?.acceptedFormats ?? FILE_TYPE_PRESETS.image.acceptedFormats,
        supportedFormatsLabel:
            supportedFormatsLabel ?? preset?.supportedFormatsLabel ?? FILE_TYPE_PRESETS.image.supportedFormatsLabel,
        invalidTypeMessage:
            invalidTypeMessage ?? preset?.invalidTypeMessage ?? FILE_TYPE_PRESETS.image.invalidTypeMessage,
        urlPlaceholder: urlPlaceholder ?? preset?.urlPlaceholder ?? IMAGE_URL,
    };
};

export const getFileKey = (file, index = 0) =>
    file?.lastModified != null
        ? `${file.name}-${file.size}-${file.lastModified}`
        : `${file?.name || 'file'}-${index}`;

const ResDDCustomUpload = ({
    inputId = 'resDDCustomUploadFileInput',
    fileType = 'image',
    accept,
    acceptedFormats,
    supportedFormatsLabel,
    invalidTypeMessage,
    maxSize = 5 * 1024 * 1024,
    maxSizeErrorMessage,
    isMultiFileUpload = true,
    maxFiles,
    isShowUrl = false,
    urlPlaceholder,
    control,
    urlName,
    urlValue,
    urlRules,
    urlSupportedFormatsLabel,
    showMaxSizeHint = true,
    maxSizeHintLabel,
    formatsHint,
    dropZoneExtra,
    urlHint,
    urlSize,
    useExternalValidation = false,
    onUrlChange,
    onUrlBlur,
    onUrlPaste,
    dragDropText,
    browseButtonText = 'Browse files',
    selectedFile = null,
    selectedFiles = [],
    invalidFileKeys = [],
    errorMessage = '',
    disabled = false,
    isProcessing = false,
    isFileInvalid = false,
    className = '',
    mainClass = '',
    iconClassName = `${builder_upload_large} icon-lg color-primary-blue`,
    onFileSelect,
    onFilesSelect,
    onClear,
    onRemoveFile,
    onValidationError,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [localInvalid, setLocalInvalid] = useState(false);
    const [localErrorMessage, setLocalErrorMessage] = useState('');

    const watchedUrl = useWatch({
        control,
        name: urlName,
        disabled: !isShowUrl || !control || !urlName,
    });

    const config = useMemo(
        () =>
            resolveUploadConfig({
                fileType,
                accept,
                acceptedFormats,
                supportedFormatsLabel,
                invalidTypeMessage,
                urlPlaceholder,
            }),
        [fileType, accept, acceptedFormats, supportedFormatsLabel, invalidTypeMessage, urlPlaceholder],
    );

    const resolvedUrlValue = urlValue ?? watchedUrl ?? '';
    const hasUrlValue = !!resolvedUrlValue;
    const resolvedUrlFormatsLabel = urlSupportedFormatsLabel ?? config.supportedFormatsLabel;
    const maxSizeMb = Math.round(maxSize / (1024 * 1024));

    const resolvedDragDropText =
        dragDropText ?? (isMultiFileUpload ? 'Drag & Drop your files here' : 'Drag & Drop your file here');

    const filesToRender = isMultiFileUpload ? selectedFiles : selectedFile ? [selectedFile] : [];
    const hasSelectedFiles = filesToRender.length > 0;

    const hasReachedMaxFiles =
        isMultiFileUpload && maxFiles != null && selectedFiles.length >= maxFiles;

    const isZoneDisabled =
        disabled ||
        isProcessing ||
        hasReachedMaxFiles ||
        (!isMultiFileUpload && !!selectedFile) ||
        (isShowUrl && hasUrlValue);

    const showInvalid = isFileInvalid || localInvalid;
    const displayError = errorMessage || (localInvalid ? localErrorMessage : '');

    const checkFile = (file) => {
        if (useExternalValidation) {
            return { isValid: true, message: '' };
        }

        const extensions = parseAcceptExtensions(config.accept);
        const fileExt = (file.name || '').toLowerCase().split('.').pop();

        const isMimeAllowed =
            !config.acceptedFormats?.length ||
            config.acceptedFormats.includes(file.type) ||
            (file.type === '' && extensions.includes(fileExt));

        const isExtAllowed =
            !extensions.length || extensions.includes(fileExt) || config.accept === '*';

        if (!isMimeAllowed && !isExtAllowed) {
            return { isValid: false, message: config.invalidTypeMessage };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                message: maxSizeErrorMessage || `File size max. ${maxSizeMb} MB`,
            };
        }

        return { isValid: true, message: '' };
    };

    const processFiles = (fileList) => {
        const incoming = Array.from(fileList || []);
        if (!incoming.length) return;

        const availableSlots =
            isMultiFileUpload && maxFiles != null
                ? Math.max(0, maxFiles - selectedFiles.length)
                : incoming.length;

        const filesToProcess = isMultiFileUpload ? incoming.slice(0, availableSlots) : [incoming[0]];

        const results = filesToProcess.map((file) => {
            const { isValid, message } = checkFile(file);
            return { file, isValid, message };
        });

        const validFiles = results.filter((item) => item.isValid).map((item) => item.file);
        const invalidResults = results.filter((item) => !item.isValid);

        if (invalidResults.length) {
            const firstError = invalidResults[0];
            setLocalErrorMessage(firstError.message);
            setLocalInvalid(true);
            invalidResults.forEach(({ file, message }) => onValidationError?.(message, file));
        } else {
            setLocalInvalid(false);
            setLocalErrorMessage('');
        }

        results.forEach(({ file, isValid }) => onFileSelect?.(file, { isValid }));

        if (isMultiFileUpload) {
            onFilesSelect?.(results, { validFiles, invalidFiles: invalidResults.map((item) => item.file) });
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isZoneDisabled) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isZoneDisabled) return;
        processFiles(e.dataTransfer?.files);
    };

    const handleBrowseClick = () => {
        if (!isZoneDisabled) document.getElementById(inputId)?.click();
    };

    const handleFileInputChange = (e) => {
        processFiles(e.target?.files);
        e.target.value = '';
    };

    const handleClearAll = () => {
        setLocalInvalid(false);
        setLocalErrorMessage('');
        onClear?.();
        const input = document.getElementById(inputId);
        if (input) input.value = '';
    };

    const handleRemoveFile = (file, index) => {
        if (onRemoveFile) {
            onRemoveFile(file, index);
            return;
        }
        if (!isMultiFileUpload) {
            handleClearAll();
        }
    };

    const zoneClassName = [
        UPLOAD_CLASS.zone,
        isDragging ? UPLOAD_CLASS.zoneDragging : '',
        isZoneDisabled ? UPLOAD_CLASS.zoneDisabled : '',
    ]
        .filter(Boolean)
        .join(' ');

    const renderFileRow = (file, index) => {
        const fileKey = getFileKey(file, index);
        const isRowInvalid = invalidFileKeys.includes(fileKey) || (showInvalid && !isMultiFileUpload);
        const rowClassName = [
            UPLOAD_CLASS.selectedFile,
            'position-relative',
            isRowInvalid ? UPLOAD_CLASS.selectedFileInvalid : UPLOAD_CLASS.selectedFileValid,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div key={fileKey} className={rowClassName}>
                {file.name?.length > 30 ? (
                    <RSTooltip text={file.name} position="top">
                        <span className={UPLOAD_CLASS.fileName}>{truncateTitle(file.name, 30)}</span>
                    </RSTooltip>
                ) : (
                    <span className={UPLOAD_CLASS.fileName}>{file.name}</span>
                )}
                <RSTooltip position="top" text="Delete" className="lh0 position-absolute right10">
                    <i
                        className={`${delete_mini} icon-sm color-primary-red`}
                        onClick={() => handleRemoveFile(file, index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleRemoveFile(file, index)}
                        aria-label={`Remove ${file.name}`}
                    />
                </RSTooltip>
            </div>
        );
    };

    return (
        <div className={`${UPLOAD_CLASS.wrapper} ${mainClass} ${className}`.trim()}>
            <div
                className={zoneClassName}
                onDragEnter={!isZoneDisabled ? handleDragEnter : undefined}
                onDragOver={!isZoneDisabled ? handleDragOver : undefined}
                onDragLeave={!isZoneDisabled ? handleDragLeave : undefined}
                onDrop={!isZoneDisabled ? handleDrop : undefined}
            >
                <input
                    type="file"
                    id={inputId}
                    style={{ display: 'none' }}
                    accept={config.accept}
                    multiple={isMultiFileUpload}
                    onChange={handleFileInputChange}
                    disabled={isZoneDisabled}
                />
                <div className={UPLOAD_CLASS.content}>
                    <i className={iconClassName} aria-hidden />
                    <p className={`${UPLOAD_CLASS.text} `}>{resolvedDragDropText}</p>
                    <p className={`${UPLOAD_CLASS.text} fs15`}>or</p>
                    <button
                        type="button"
                        className={`${UPLOAD_CLASS.browseBtn} d-inline-flex align-items-center gap-2`}
                        onClick={handleBrowseClick}
                        disabled={isZoneDisabled || isProcessing}
                    >
                        {isProcessing && <div className="segment_loader" style={{ width: 14, height: 14 }} />}
                        {isProcessing ? 'Uploading...' : browseButtonText}
                    </button>
                    {formatsHint ?? (
                        <small className={`${UPLOAD_CLASS.formats} d-block`}>
                            Supported formats: {config.supportedFormatsLabel}
                            {isMultiFileUpload && maxFiles != null ? ` · Max ${maxFiles} files` : ''}
                        </small>
                    )}
                    {showMaxSizeHint && (maxSizeHintLabel || maxSizeMb > 0) && (
                        <small className={`${UPLOAD_CLASS.formats} d-block mt5`}>
                            Maximum file size: {maxSizeHintLabel ?? `${maxSizeMb}MB`}
                        </small>
                    )}
                    {dropZoneExtra}
                </div>
            </div>

            {filesToRender.length > 0 && (
                <div className={UPLOAD_CLASS.selectedList}>
                    {filesToRender.map((file, index) => renderFileRow(file, index))}
                </div>
            )}

            {displayError && (
                <small className={`${UPLOAD_CLASS.error} err-msg color-primary-red`}>{displayError}</small>
            )}

            {isShowUrl && (
                <div className={UPLOAD_CLASS.urlSection}>
                    <Divider />

                    <Row>
                        <Col sm={12}>
                            {control && urlName && (
                                <RSInput
                                    control={control}
                                    name={urlName}
                                    placeholder={config.urlPlaceholder}
                                    size={urlSize}
                                    disabled={hasSelectedFiles}
                                    handleOnchange={onUrlChange}
                                    handleOnBlur={onUrlBlur}
                                    handleOnPaste={onUrlPaste}
                                    rules={urlRules}
                                />
                            )}
                            {urlHint ?? (
                                <small className={`${UPLOAD_CLASS.urlHint} fs11 lh-sm`}>
                                    Supported formats: {resolvedUrlFormatsLabel}
                                </small>
                            )}
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};

ResDDCustomUpload.propTypes = {
    inputId: PropTypes.string,
    fileType: PropTypes.oneOf(['image', 'video', 'gif', 'csv', 'zip', 'file']),
    accept: PropTypes.string,
    acceptedFormats: PropTypes.arrayOf(PropTypes.string),
    supportedFormatsLabel: PropTypes.string,
    invalidTypeMessage: PropTypes.string,
    maxSize: PropTypes.number,
    maxSizeErrorMessage: PropTypes.string,
    isMultiFileUpload: PropTypes.bool,
    maxFiles: PropTypes.number,
    isShowUrl: PropTypes.bool,
    urlPlaceholder: PropTypes.string,
    control: PropTypes.object,
    urlName: PropTypes.string,
    urlValue: PropTypes.string,
    urlRules: PropTypes.object,
    urlSupportedFormatsLabel: PropTypes.string,
    showMaxSizeHint: PropTypes.bool,
    maxSizeHintLabel: PropTypes.string,
    formatsHint: PropTypes.node,
    dropZoneExtra: PropTypes.node,
    urlHint: PropTypes.node,
    urlSize: PropTypes.number,
    useExternalValidation: PropTypes.bool,
    onUrlChange: PropTypes.func,
    onUrlBlur: PropTypes.func,
    onUrlPaste: PropTypes.func,
    dragDropText: PropTypes.string,
    browseButtonText: PropTypes.string,
    selectedFile: PropTypes.object,
    selectedFiles: PropTypes.arrayOf(PropTypes.object),
    invalidFileKeys: PropTypes.arrayOf(PropTypes.string),
    errorMessage: PropTypes.string,
    disabled: PropTypes.bool,
    isProcessing: PropTypes.bool,
    isFileInvalid: PropTypes.bool,
    className: PropTypes.string,
    mainClass: PropTypes.string,
    iconClassName: PropTypes.string,
    onFileSelect: PropTypes.func,
    onFilesSelect: PropTypes.func,
    onClear: PropTypes.func,
    onRemoveFile: PropTypes.func,
    onValidationError: PropTypes.func,
};

export default memo(ResDDCustomUpload);
