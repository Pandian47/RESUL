import React, { useState } from 'react';

export const useImageUpload = (setValue, setError, clearErrors, fieldName, maxSizeBytes = 512000) => {
    const fileInputRef = React.useRef(null);
    const [imageModalState, setImageModalState] = useState({
        show: false,
        tempImageData: null,
    });

    const handleNativeFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check format
        const formats = ['.png', '.jpg', '.jpeg'];
        const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (!formats.includes(extension)) {
            setError(fieldName, {
                type: 'custom',
                message: 'Invalid file format',
            });
            return;
        }

        // Check size (e.g. 500kb = 512000 bytes)
        if (file.size > maxSizeBytes) {
            setError(fieldName, {
                type: 'custom',
                message: `File size should not exceed ${maxSizeBytes / 1024}kb`,
            });
            return;
        }

        clearErrors(fieldName);

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            setImageModalState({ show: true, tempImageData: base64 });
        };
        reader.readAsDataURL(file);

        e.target.value = null;
    };

    const openCropWithExistingImage = (currentImage) => {
        if (currentImage) {
            let imageForCrop = currentImage;
            if (!currentImage.includes('data:image')) {
                const isBase64Includes = currentImage?.includes('base64') || false;
                if (isBase64Includes) {
                    imageForCrop = currentImage;
                } else {
                    imageForCrop = `data:image/png;base64,${currentImage}`;
                }
            }
            setImageModalState({ show: true, tempImageData: imageForCrop });
        }
    };

    const handleCropComplete = (croppedImage) => {
        setValue(fieldName, croppedImage);
        clearErrors(fieldName);
        setImageModalState({ show: false, tempImageData: null });
    };

    const handleModalClose = () => {
        setImageModalState({ show: false, tempImageData: null });
        clearErrors(fieldName);
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const setTempImageData = (data) => {
        setImageModalState((prev) => ({ ...prev, tempImageData: data }));
    };

    return {
        fileInputRef,
        imageModalState,
        handleNativeFileChange,
        openCropWithExistingImage,
        handleCropComplete,
        handleModalClose,
        triggerUpload,
        setTempImageData,
    };
};
