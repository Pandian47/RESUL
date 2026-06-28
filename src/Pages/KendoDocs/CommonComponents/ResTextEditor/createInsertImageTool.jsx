/**
 * Factory for the ResTextEditor "Insert image" toolbar tool.
 * Opens InsertImageModal (modelled on the email UploadModal) and inserts the
 * resulting <img> into the editor via EditorUtils.insertImage.
 *
 * @param {{ type?: 'media' | 'browse' }} [options]
 * @returns {React.ComponentType}  Kendo Editor toolbar tool component
 */
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { EditorUtils } from '@progress/kendo-react-editor';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { editor_image_medium } from 'Constants/GlobalConstant/Glyphicons';
import InsertImageModal from './InsertImageModal';

export const createInsertImageTool = (options = {}) => {
    const { type = 'media' } = options;

    const InsertImageTool = ({ view }) => {
        const viewRef = useRef(view);
        viewRef.current = view;

        const [showModal, setShowModal] = useState(false);

        const handleSave = ({ src, altText, title, height, width }) => {
            setShowModal(false);

            if (!src || !viewRef.current) return;

            const attrs = { src, alt: altText || '' };
            if (title) attrs.title = title;
            // append px unit if a plain number is entered
            if (height) attrs.height = /^\d+$/.test(String(height)) ? `${height}px` : height;
            if (width)  attrs.width  = /^\d+$/.test(String(width))  ? `${width}px`  : width;

            EditorUtils.insertImage(viewRef.current, attrs);
        };

        return (
            <>
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip className="toolTipOverlayZindexCSS">Insert image</Tooltip>}
                >
                    <button
                        type="button"
                        className="k-button k-button-md k-rounded-md k-button-flat k-icon-button"
                        aria-label="Insert image"
                        onMouseDown={(e) => {
                            // Prevent editor from losing focus before the modal opens
                            e.preventDefault();
                            setShowModal(true);
                        }}
                    >
                        <i className={`${editor_image_medium} icon-md`} />
                    </button>
                </OverlayTrigger>

                <InsertImageModal
                    show={showModal}
                    type={type}
                    handleClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            </>
        );
    };

    InsertImageTool.displayName = 'ResTextEditorInsertImageTool';
    InsertImageTool.propTypes = {
        view: PropTypes.object,
    };

    return InsertImageTool;
};

export default createInsertImageTool;
