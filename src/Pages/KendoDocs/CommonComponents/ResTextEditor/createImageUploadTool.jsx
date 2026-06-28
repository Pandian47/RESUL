/**
 * Factory for a Kendo Editor toolbar tool that delegates image selection to the consumer.
 * Keeps ResTextEditor free of platform-specific upload UI or services.
 */
import { useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * @param {Function} onImageUpload - Called with `{ view, file, files }` when the user selects an image.
 * @returns {React.ComponentType} Kendo Editor toolbar tool component
 */
export const createImageUploadTool = (onImageUpload) => {
    const ImageUploadTool = ({ view }) => {
        const inputRef = useRef(null);

        const handleFileChange = (event) => {
            const { files } = event.target;
            const file = files?.[0];
            if (file && typeof onImageUpload === 'function') {
                onImageUpload({ view, file, files });
            }
            event.target.value = '';
        };

        return (
            <>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="restexteditor-image-input"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    tabIndex={-1}
                    aria-hidden
                />
                <button
                    type="button"
                    className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-icon-button"
                    title="Insert image"
                    aria-label="Insert image"
                    onClick={() => inputRef.current?.click()}
                >
                    <span className="k-button-icon k-icon k-i-image" />
                </button>
            </>
        );
    };

    ImageUploadTool.displayName = 'ResTextEditorImageUploadTool';
    ImageUploadTool.propTypes = {
        view: PropTypes.object,
    };

    return ImageUploadTool;
};

export default createImageUploadTool;
