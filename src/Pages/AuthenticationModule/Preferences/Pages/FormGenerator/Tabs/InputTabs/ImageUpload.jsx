import { memo, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { uploadWebPushImage } from 'Reducers/communication/createCommunication/Create/request';
import ResDDCustomUpload, { FILE_TYPE_PRESETS } from 'Pages/KendoDocs/CommonComponents/ResDDCustomUpload';

const IMAGE_PRESET = FILE_TYPE_PRESETS.image;

const ImageUpload = ({
    fieldName,
    inputId = 'imageDragDropFileInput',
    acceptedFormats = IMAGE_PRESET.acceptedFormats,
    accept = IMAGE_PRESET.accept,
    supportedFormatsLabel = IMAGE_PRESET.supportedFormatsLabel,
    fileType = 'image',
    maxSize = 5000000,
    isShowImageURL = true,
    control,
}) => {
    const { watch, getFieldState, setValue, setError, clearErrors } = useFormContext();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId, departmentName, isAgency } = useSelector((state) => getSessionId(state));

    const [selectedFile, setSelectedFile] = useState(null);
    const [isFileInvalid, setIsFileInvalid] = useState(false);
    const [isPasted, setIsPasted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const imageInputUrl = watch(fieldName + '.inputUrl') || '';
    const imageUrl = watch(fieldName) || '';

    useEffect(() => {
        if (imageUrl && !selectedFile && !imageInputUrl && typeof imageUrl === 'string') {
            let fileName = 'Image';

            if (imageUrl.startsWith('data:')) {
                fileName = 'Uploaded Image';
            } else {
                fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                if (fileName.includes('?')) {
                    fileName = fileName.split('?')[0];
                }
                try {
                    fileName = decodeURIComponent(fileName);
                } catch (e) {
                    // keep decoded fallback
                }
            }

            if (fileName) {
                setSelectedFile({ name: fileName });
            }
        }
    }, [imageUrl, selectedFile, imageInputUrl]);

    const uploadFile = async (file) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target.result;
            const base64Only = base64String?.split(';base64,')?.pop();
            setIsUploading(true);
            const imageFormat = file.name?.split('.')?.pop()?.toLowerCase() || 'png';

            const allowedFormats = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
            if (!allowedFormats.includes(imageFormat)) {
                setIsFileInvalid(true);
                setValue(fieldName, '');
                setError(fieldName, {
                    type: 'custom',
                    message: `Image format not supported. Allowed formats: ${allowedFormats.join(', ')}`,
                });
                setIsUploading(false);
                return;
            }

            const payload = {
                base64Image: base64Only,
                imageFormat,
                contentLength: file.size,
                departmentId,
                clientId,
                departmentName,
                userId,
                isAgency,
            };

            try {
                const res = await dispatch(uploadWebPushImage(payload));
                if (res?.status && res?.data) {
                    const uploadedImageUrl =
                        typeof res?.data === 'string'
                            ? res?.data
                            : res?.data?.url || res?.data?.imageUrl || res?.data?.inputUrl || res?.data?.data || '';
                    setValue(fieldName, uploadedImageUrl, { shouldValidate: true, shouldDirty: true });
                    setIsFileInvalid(false);
                    setIsUploading(false);
                } else {
                    setIsFileInvalid(true);
                    setValue(fieldName, '');
                    setError(fieldName, {
                        type: 'custom',
                        message: res?.message || 'Upload failed. Please try again.',
                    });
                    setIsUploading(false);
                }
            } catch (error) {
                setIsFileInvalid(true);
                setValue(fieldName, '');
                setError(fieldName, {
                    type: 'custom',
                    message: error?.message || 'Upload failed. Please try again.',
                });
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = async (file, { isValid } = {}) => {
        setSelectedFile(file);
        setValue(fieldName + '.inputUrl', '');

        if (!isValid) {
            setIsFileInvalid(true);
            return;
        }

        setIsFileInvalid(false);
        clearErrors(fieldName);
        await uploadFile(file);
    };

    const handleValidationError = (message) => {
        setIsFileInvalid(true);
        setError(fieldName, { type: 'custom', message });
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setIsFileInvalid(false);
        setValue(fieldName, '');
        setValue(fieldName + '.inputUrl', '');
        clearErrors(fieldName);
    };

    const validateImageUrl = (url) =>
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });

    const handleUrlInputChange = (e) => {
        if (e.target.value) {
            setSelectedFile(null);
            setIsFileInvalid(false);
            clearErrors(fieldName);
        }
    };

    const validateUrlValue = async (url) => {
        const isValid = await validateImageUrl(url);
        if (!isValid) {
            setError(fieldName, { type: 'custom', message: 'Enter valid image URL' });
            return;
        }

        const urlPattern = /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
        const hasImageExtension = /(\.png|\.jpg|\.jpeg|\.gif|\.webp)(\?.*)?$/i.test(url);

        if (urlPattern.test(url) && hasImageExtension) {
            setValue(fieldName, url, { shouldValidate: true, shouldDirty: true });
        } else {
            setError(fieldName, { type: 'custom', message: 'Enter valid image URL' });
        }
    };

    const handleUrlInputBlur = async (e) => {
        if (!isPasted && !!e.target.value) {
            await validateUrlValue(e.target.value);
        }
        setIsPasted(false);
    };

    const handleUrlInputPaste = async (e) => {
        const pastedData = e.clipboardData.getData('text');
        if (!!pastedData) {
            setIsPasted(true);
            setValue(fieldName + '.inputUrl', pastedData);
            setTimeout(async () => {
                await validateUrlValue(pastedData);
                setIsPasted(false);
            }, 100);
        }
    };

    const urlFieldName = fieldName + '.inputUrl';

    return (
        <ResDDCustomUpload
            inputId={inputId}
            fileType={fileType}
            accept={accept}
            acceptedFormats={acceptedFormats}
            supportedFormatsLabel={supportedFormatsLabel}
            maxSize={maxSize}
            maxSizeErrorMessage={`Image size max. ${Math.round(maxSize / 1000000)} MB`}
            isMultiFileUpload={false}
            isShowUrl={isShowImageURL}
            control={control}
            urlName={urlFieldName}
            urlSupportedFormatsLabel={supportedFormatsLabel}
            selectedFile={selectedFile}
            disabled={!!imageInputUrl || !!selectedFile}
            isProcessing={isUploading}
            isFileInvalid={isFileInvalid}
            onFileSelect={handleFileSelect}
            onClear={handleClearFile}
            onValidationError={handleValidationError}
            onUrlChange={handleUrlInputChange}
            onUrlBlur={handleUrlInputBlur}
            onUrlPaste={handleUrlInputPaste}
            urlRules={{
                validate: (url) => {
                    if (!url) return true;
                    return validateImageUrl(url).then((isValid) => {
                        if (!isValid) return 'Enter valid image URL';
                        const urlPattern =
                            /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
                        const hasImageExtension = /(\.png|\.jpg|\.jpeg|\.gif|\.webp)(\?.*)?$/i.test(url);
                        return urlPattern.test(url) && hasImageExtension ? true : 'Enter valid image URL';
                    });
                },
            }}
        />
    );
};

export default memo(ImageUpload);
