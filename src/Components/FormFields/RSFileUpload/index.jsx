import { FILE_SIZE_EXCEED, INVALID_FORMAT } from 'Constants/GlobalConstant/ValidationMessage';
import { ALLOWED_FORMATS, FILE_NAME_EXTENSIONS_JPG_PNG, FILE_NAME_EXTENSIONS_JPG_PNG_GIF, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1 } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import { Controller } from 'react-hook-form';
import { RSPrimaryButton } from 'Components/Buttons';
import { formatMaxFileSizeDisplay } from 'Utils/modules/formatters';
import { formatBytes } from 'Utils/modules/dateTime';
import { getFileToBase64 } from 'Utils/base64/index';
import RSTooltip from 'Components/RSTooltip';

// Module-level Map to store file names by field name (for preserving names across tab switches)
const fileNameCache = new Map();

const RSFileUpload = ({
    control,
    setError,
    clearErrors,
    name,
    rules,
    defaultValue,
    text,
    label,
    accept = '',
    option2 = '',
    size = null,
    handleChange = () => {},
    placeholder = 'Choose file',
    isbase64 = false,
    required = false,
    className = '',
    isPrefix = false,
    isCustomFormat=false,
    isSmall = false,
    containerClass,
    base64Data,
    isBase64Status,
    fileClass,
    fileCol,
    btnCol,
    children,
    reportUpload,
    watch,
    fileType = 'img',
    isRaw = false,
    moreFiles = false,
    isUpload,
    customTop,
    customBottomText,
    isOffer = false,
    isRefresh = false,
    isRCS = false,
    customInputClass = '',
    resetValue = () => {},
    customEmailFooterText = '',
    labelInputClassName = '',
    isCustomElement = '',
    isCustomValue = '',
    channelType = '',
    platformType = null,
    customRenderText,
     isUploadResetIconOutside=false,
    onResetIconVisible,
    isLoading = false,
    ...rest
}) => {
    const inputRef = useRef();
    const resolvedPlaceholder = placeholder?.length > 0 ? placeholder : 'Choose file';
    const [fileName, setFileName] = useState(resolvedPlaceholder);
    const watchName = watch(name);
    const hasUploadedFileValue = Boolean(
        watchName != null && String(watchName).trim().length > 0,
    );
    const isPlaceholderFileName = !fileName || fileName === 'Choose file';
    const isResetIconVisible = Boolean(
        isRefresh && hasUploadedFileValue && !isPlaceholderFileName,
    );

    useEffect(() => {
        onResetIconVisible?.(isResetIconVisible);
    }, [isResetIconVisible, onResetIconVisible]);
    useEffect(() => {
        if (!isOffer) {
            if (placeholder) {
                setFileName(placeholder);
            } else {
                setFileName('Choose file');
            }
        }
    }, [placeholder]);

    useEffect(() => {
        if (isOffer) {
            if (placeholder) {
                setFileName(placeholder);
            } else {
                setFileName('Choose file');
            }
        }
    }, [placeholder, fileName]);

    // Handle file name extraction from URL (edit mode) and restoration from cache (tab switching)
    useEffect(() => {
        if (watchName && typeof watchName === 'string' && watchName.length > 0) {
            // Extract file name from URL (edit mode)
            if (watchName.startsWith('http://') || watchName.startsWith('https://')) {
                try {
                    // Normalize the URL by replacing backslashes with forward slashes
                    const normalizedUrl = watchName.replace(/\\/g, '/');
                    const url = new URL(normalizedUrl);
                    const pathParts = url.pathname.split('/');
                    const fileNameFromUrl = pathParts[pathParts.length - 1];
                    if (fileNameFromUrl && fileNameFromUrl.includes('.')) {
                        setFileName(fileNameFromUrl);
                        // Store in cache for this field
                        fileNameCache.set(name, fileNameFromUrl);
                        return;
                    }
                } catch (e) {
                    // If URL parsing fails, try to extract from path directly
                }
                // Fallback: extract from path directly (handles backslashes)
                const pathParts = watchName.split(/[/\\]/);
                const fileNameFromPath = pathParts[pathParts.length - 1];
                if (fileNameFromPath && fileNameFromPath.includes('.')) {
                    setFileName(fileNameFromPath);
                    fileNameCache.set(name, fileNameFromPath);
                }
            } 
            // For base64 strings (uploaded files), restore file name from cache
            else if (watchName.startsWith('data:')) {
                const cachedFileName = fileNameCache.get(name);
                if (cachedFileName) {
                    setFileName(cachedFileName);
                }
            }
        } else if (!watchName) {
            // Reset to placeholder when value is cleared
            setFileName(resolvedPlaceholder);
        }
    }, [watchName, name, resolvedPlaceholder]);

    const handleFileUploadChange = () => {
        if (isLoading) return;
        inputRef.current.value = '';
        setFileName(resolvedPlaceholder);
        inputRef.current.click();
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            defaultValue={defaultValue}
            render={({ field: { onChange, ref, value, ...restField }, fieldState: { error } }) => {
                let errMsg = _get(error, `message`, '');

                // useEffect(() => {
                //     if (!value) {
                //         setFileName('Choose file');
                //     } else {
                //         setFileName(value[0]?.name);
                //         // let a = inputRef.current.value.split('//');
                //         // setFileName(a[a?.length - 1]);
                //     }
                // }, [value]);

                return (
                    <div className={`rs-file-upload-wrapper ${containerClass ?? ''}`.trim()}>
                        <>
                            <div
                                //sm={fileCol ?? 9}
                                className={`d-flex gap-3 justify-content-between ${fileClass}  ${customTop && ''}`}
                            >
                                <div className={`rsfuw-input-wrapper w-100`} style={{minWidth:"0"}}>
                                    <label
                                        className={`rsfuw-label ${labelInputClassName} ${required ? 'required' : ''} ${
                                            !!errMsg ? 'color-primary-red' : ''
                                        }`}
                                        title={!!errMsg ? errMsg : fileName}
                                    >
                                        {!!errMsg ? errMsg : fileName}
                                    </label>
                                    <input
                                        type="file"
                                        accept={accept}
                                        multiple={moreFiles}
                                        className={`rsfuw-input ${className} ${required ? 'required' : ''} ${
                                            isResetIconVisible ? 'click-off' : ''
                                        }`}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            // console.log('file :::: ', file);
                                            if (accept?.length) {
                                                const formats = accept.split(',');
                                                if (
                                                    !formats.some((format) => file?.name.endsWith(format.toLowerCase()))
                                                ) {
                                                    setError(name, {
                                                        type: 'custom',
                                                        message: INVALID_FORMAT,
                                                    });
                                                    setFileName('Choose file');
                                                    return;
                                                }
                                            }
                                            if (size !== null && file.size >= size) {
                                                setError(name, {
                                                    type: 'custom',
                                                    message: FILE_SIZE_EXCEED + formatBytes(size),
                                                });
                                                return;
                                            }
                                            clearErrors(name);
                                            handleChange(e);
                                            if (isbase64) {
                                                const imgPrefix = 'data:image/' + file?.name.split('.')[1] + ';base64,';
                                                const videoPrefix = 'data:video/mpeg;base64,';
                                                const pdfPrefix = 'data:application/pdf;base64';
                                                const prefixData =
                                                    fileType === 'img'
                                                        ? imgPrefix
                                                        : fileType === 'pdf'
                                                        ? pdfPrefix
                                                        : videoPrefix;
                                                const prefix = isPrefix ? prefixData : '';
                                                getFileToBase64(
                                                    file,
                                                    (base64) => {
                                                        if (isBase64Status) {
                                                            base64Data(base64, file.name, file.size, file);
                                                        }
                                                        if (!moreFiles) {
                                                            setFileName(file.name);
                                                            // Store file name in cache for tab switching
                                                            fileNameCache.set(name, file.name);
                                                        }
                                                        onChange(`${prefix}${base64}`);
                                                    },
                                                    (err) => {},
                                                    isRaw,
                                                );
                                            } else {
                                                // if (!moreFiles) setFileName(file.name);
                                                // onChange(e.target.files);
                                            }
                                            // e.target.value = null;
                                        }}
                                        ref={(e) => {
                                            inputRef.current = e;
                                            ref(e);
                                        }}
                                        {...restField}
                                        {...rest}
                                    />
                                    {customRenderText && customRenderText}
                                   
                                </div>
                                <div className='d-flex float-end mt-11 align-items-center'>
                                     <div
                                        className={`rsfuw-button-wrapper ${
                                            customInputClass ? customInputClass : ''
                                        } ${isResetIconVisible || isLoading ? 'pe-none click-off' : ''}`}
                                    >
                                        {isCustomElement ? (
                                            <div
                                                onClick={() => {
                                                    if (!isLoading) handleFileUploadChange();
                                                }}
                                            >
                                                {isCustomElement}
                                            </div>
                                        ) : (
                                            <RSPrimaryButton
                                                onClick={() => {
                                                    if (!isLoading) handleFileUploadChange();
                                                }}
                                                disabled={isLoading}
                                                className={` text-nowrap ${
                                                    reportUpload
                                                        ? ''
                                                        : isUpload
                                                        ? ''
                                                        : customTop
                                                        ? ''
                                                        : ''
                                                }`}
                                                id="rs_RSFileUpload_primary"
                                            >
                                                {text ? text : customEmailFooterText ? customEmailFooterText : 'Upload'}
                                            </RSPrimaryButton>
                                        )}
                                        {children}
                                    </div>
                                    {isResetIconVisible && (
                                        <RSTooltip text={'Reset'} position="top" className={isUploadResetIconOutside ?  "bottom0 ml15 position-absolute Left100" : 'lh0 ml15'}>
                                            <i
                                                id="rs_data_refresh"
                                                className={`${restart_medium} icon-md color-primary-blue`}
                                                onClick={() => {
                                                    clearErrors();
                                                    setFileName(resolvedPlaceholder);
                                                    fileNameCache.delete(name);
                                                    if (inputRef.current) {
                                                        inputRef.current.value = '';
                                                    }
                                                    onChange('');
                                                    resetValue();
                                                }}
                                            />
                                        </RSTooltip>
                                    )}
                                </div>
                                {customBottomText && (
                                    <small className="small-text-space-top">
                                        {ALLOWED_FORMATS}{' '}
                                        {platformType === 'instagram'
                                            ? FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1
                                            : ['twitter', 'linkedIn', 'pinterest'].includes(platformType)
                                            ? FILE_NAME_EXTENSIONS_JPG_PNG_GIF
                                            : isCustomFormat
                                            ? FILE_NAME_EXTENSIONS_JPG_PNG_JPEG
                                            : isRCS
                                            ? FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1
                                            : isCustomValue
                                            ? isCustomValue
                                            : FILE_NAME_EXTENSIONS_JPG_PNG}
                                    </small>
                                )}
                                {size && channelType === 'socialMedia' && (
                                    <small className="small-text-space-top">
                                        {`Max ${fileType === 'video' ? 'video' : fileType === 'pdf' ? 'document' : 'image'} size: ${formatMaxFileSizeDisplay(size)}`}
                                    </small>
                                )}
                            </div>
                        </>
                    </div>
                );
            }}
        />
    );
};

RSFileUpload.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    setError: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired,
    rules: PropTypes.object,
    text: PropTypes.string,
    placeholder: PropTypes.string,
    handleChange: PropTypes.func,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    option2: PropTypes.string,
    className: PropTypes.string,
    containerClass: PropTypes.string,
    required: PropTypes.bool,
    isPrefix: PropTypes.bool,
    isSmall: PropTypes.bool,
    isbase64: PropTypes.bool,
    isBase64Status: PropTypes.bool,
    base64Data: PropTypes.func,
    fileType: PropTypes.string,
    isRaw: PropTypes.bool,
    moreFiles: PropTypes.bool,
    customRenderText: PropTypes.node,
    onResetIconVisible: PropTypes.func,
    isLoading: PropTypes.bool,
};

export default memo(RSFileUpload);
