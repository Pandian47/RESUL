import { CHANGE_PICTURE, CONFIRM, RESET_ZOOM, ZOOM_IN, ZOOM_OUT } from 'Constants/GlobalConstant/Placeholders';
import { minus_edge_mini, plus_edge_mini, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Row, Col } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';

const ImageCropComponent = ({
    imageSrc,
    onCropComplete,
    onCancel,
    aspectRatio = 1,
    cropShape = 'rect',
    showGrid = true,
    height = '400px',
    setShowFileUpload = () => { },
    setTempImageData = () => { },
    setValue = () => { },
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [minZoom, setMinZoom] = useState(0.1);
    const [maxZoom, setMaxZoom] = useState(3);
    const [initialZoom, setInitialZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [croppedArea, setCroppedArea] = useState(null);
    const containerRef = useRef(null);

    const onCropChange = useCallback((crop) => {
        setCrop(crop);
    }, []);

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedArea(croppedArea);
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onZoomChange = useCallback((zoom) => {
        setZoom(zoom);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (croppedAreaPixels && imageSrc) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, croppedArea);
                onCropComplete(croppedImage);
            } catch (error) {
            }
        }
    }, [croppedAreaPixels, croppedArea, imageSrc, onCropComplete]);

    const handleCancel = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        onCancel();
    };

    if (!imageSrc) {
        return null;
    }

    const handleZoomOut = () => {
        setZoom((prevZoom) => Math.max(minZoom, +(prevZoom - 0.1).toFixed(2)));
    };

    const handleZoomIn = () => {
        setZoom((prevZoom) => Math.min(maxZoom, +(prevZoom + 0.1).toFixed(2)));
    };

    const handleResetZoom = () => {
        setZoom(initialZoom);
    };

    const onMediaLoaded = useCallback((mediaSize) => {
        const { naturalWidth, naturalHeight, width, height } = mediaSize;
        
        if (!containerRef.current) return;
        
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        // For circular crops, the crop area is a circle inscribed in the container
        const cropDiameter = Math.min(containerWidth, containerHeight);
        
        // Calculate the aspect ratio of the image
        const imageAspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;
        
        // With objectFit="cover", width and height from mediaSize are the displayed dimensions at zoom=1
        // We need to calculate what zoom makes the image fit within the crop area
        let calculatedZoom;
        
        if (cropShape === 'round' && aspectRatio === 1) {
            // For circular crops, use the displayed dimensions from mediaSize (after cover scaling at zoom=1)
            // Calculate zoom needed so the image fits within the circle
            const maxDisplayedDimension = Math.max(width, height);
            calculatedZoom = cropDiameter / maxDisplayedDimension;
        } else {
            // For rectangular crops
            if (imageAspectRatio > containerAspectRatio) {
                // Image is wider - cover scales based on height
                const coverHeight = containerHeight;
                const coverWidth = containerHeight * imageAspectRatio;
                calculatedZoom = containerWidth / coverWidth;
            } else {
                // Image is taller - cover scales based on width
                const coverWidth = containerWidth;
                const coverHeight = containerWidth / imageAspectRatio;
                calculatedZoom = containerHeight / coverHeight;
            }
        }
        
        // Clamp the zoom to reasonable values
        const clampedZoom = Math.max(0.1, Math.min(3, calculatedZoom));
        
        // Set minZoom to allow some zoom out (but not too much)
        const dynamicMinZoom = Math.max(0.1, clampedZoom * 0.5);
        
        // Set maxZoom to allow zoom in
        const dynamicMaxZoom = Math.max(3, clampedZoom * 2);
        
        setMinZoom(dynamicMinZoom);
        setMaxZoom(dynamicMaxZoom);
        setInitialZoom(clampedZoom);
        setZoom(clampedZoom);
    }, [cropShape, aspectRatio]);

    return (
        <div className="image-crop-component">
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: height,
                    background: `
                        linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
                        linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
                        linear-gradient(-45deg, transparent 75%, #f8f9fa 75%),
                        #ffffff
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    border: '2px solid #c2cfe3',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}
            >
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteCallback}
                    onZoomChange={onZoomChange}
                    onMediaLoaded={onMediaLoaded}
                    cropShape={cropShape}
                    showGrid={showGrid}
                    restrictPosition={false}
                    objectFit="cover"
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    style={{
                        containerStyle: {
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                        },
                    }}
                />

                {/* Zoom Controls */}
                <ul className='rs-image-crop-zoomControls'>
                    {/* Zoom Out Button */}
                    <li>
                    <RSTooltip text={ZOOM_OUT} className="lh0" position="top" tooltipOverlayClass="rs-tag-remove-tooltip" innerContent={false}>
                        <i className={`${minus_edge_mini} icon-xs color-primary-blue rs-crop-zoom-btn rs-crop-zoom-out`}
                            onClick={zoom > minZoom ? handleZoomOut : undefined}
                            disabled={zoom <= minZoom}
                            style={{
                                cursor: zoom <= minZoom ? 'not-allowed' : 'pointer',
                                opacity: zoom <= minZoom ? 0.6 : 1,
                            }}
                       />
                    </RSTooltip></li>

                    {/* Zoom In Button */}
                    <li>
                    <RSTooltip text={ZOOM_IN} className="lh0" position="top" tooltipOverlayClass="rs-tag-remove-tooltip" innerContent={false}>
                        <i className={`${plus_edge_mini} icon-xs white rs-crop-zoom-btn rs-crop-zoom-in`}
                            onClick={zoom < maxZoom ? handleZoomIn : undefined}
                            disabled={zoom >= maxZoom}
                            style={{
                                cursor: zoom >= maxZoom ? 'not-allowed' : 'pointer',
                                opacity: zoom >= maxZoom ? 0.6 : 1,
                            }}
                        />
                    </RSTooltip></li>

                    {/* Reset Zoom Button */}
                    <li>
                    <RSTooltip text={RESET_ZOOM} className="lh0" position="top" tooltipOverlayClass="rs-tag-remove-tooltip" innerContent={false}>
                        <i
                        className={`${restart_medium} icon-md color-primary-blue rs-crop-zoom-btn rs-crop-zoom-reset`}
                            onClick={zoom !== initialZoom ? handleResetZoom : undefined}
                            disabled={zoom === initialZoom}
                            style={{
                                cursor: zoom === initialZoom ? 'not-allowed' : 'pointer',
                                opacity: zoom === initialZoom ? 0.6 : 1,
                            }}
                       />
                    </RSTooltip></li>
                </ul>
            </div>

            <Row className="mt30">
                <Col className="text-end">
                    <RSSecondaryButton
                        type="button"
                        className={'mr21'}
                        onClick={() => {
                            setTempImageData(null);
                            setValue('uploadImageName', null);
                            setShowFileUpload(true);
                        }}
                    >
                        {CHANGE_PICTURE}
                    </RSSecondaryButton>
                    <RSPrimaryButton onClick={handleConfirm} disabled={!croppedAreaPixels}>
                        {CONFIRM}
                    </RSPrimaryButton>
                </Col>
            </Row>
        </div>
    );
};

const getCroppedImg = (imageSrc, pixelCrop, percentCrop) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('No 2d context'));
                return;
            }

            // Get natural image dimensions
            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;

            // Calculate crop coordinates from percentage-based crop area
            // This is more reliable than pixelCrop for scaled/zoomed images
            const cropX = (percentCrop.x / 100) * naturalWidth;
            const cropY = (percentCrop.y / 100) * naturalHeight;
            const cropWidth = (percentCrop.width / 100) * naturalWidth;
            const cropHeight = (percentCrop.height / 100) * naturalHeight;

            // Set canvas size to the cropped area dimensions
            canvas.width = cropWidth;
            canvas.height = cropHeight;

            // Fill canvas with white background first (for transparent PNGs)
            // This ensures transparent areas show as white instead of black
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the cropped portion of the image
            ctx.drawImage(
                image,
                cropX,      // Source X (in natural image)
                cropY,      // Source Y (in natural image)
                cropWidth,  // Source width (in natural image)
                cropHeight, // Source height (in natural image)
                0,          // Destination X (on canvas)
                0,          // Destination Y (on canvas)
                cropWidth,  // Destination width (on canvas)
                cropHeight, // Destination height (on canvas)
            );

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                        const dataURL = reader.result;
                        const base64Content = dataURL.split(',')[1];
                        resolve(base64Content);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                },
                'image/jpeg',
                0.9,
            );
        };
        image.onerror = reject;
        image.src = imageSrc;
    });
};

export default ImageCropComponent;
