/**
 * InsertImageModal — image insert dialog for ResTextEditor.
 * Adapted from the email ImageUpload UploadModal; kept generic so it works in
 * any ResTextEditor instance without depending on the email-module import tree.
 *
 * Props
 * ─────
 * show        boolean   controls visibility
 * type        'media' | 'browse'   'media' = URL entry, 'browse' = file upload
 * handleClose function  called when the modal is dismissed
 * onSave      function  called with { src, altText, title, height, width }
 */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Container, Row, Col } from 'react-bootstrap';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { onlyNumbers } from 'Utils/modules/inputValidators';

const ALLOWED_IMG_EXT = ['png', 'jpg', 'jpeg'];

const MESSAGES = {
    ENTER_IMAGE_URL: 'Please enter an image URL',
    ENTER_ALT_TEXT: 'Please enter alternate text',
    UPLOAD_FILE: 'Please upload a file',
    ALLOWED_FORMATS: 'Supported formats:',
    JPG_PNG: '.jpg, .png',
    JPG_PNG_JPEG: '.jpg, .png, .jpeg',
    CANCEL: 'Cancel',
    SAVE: 'Save',
};

const validateImageUrl = (val = '') => {
    const ext = val.split('.').pop().toLowerCase();
    return ALLOWED_IMG_EXT.includes(ext) || 'Enter a valid image URL (.jpg or .png)';
};

const InsertImageModal = ({ show, type = 'media', handleClose, onSave }) => {
    const { control, clearErrors, setError, reset, handleSubmit, watch } = useForm();
    const [canSave, setCanSave] = useState(true);

    const srcValue = watch('src');

    useEffect(() => {
        if (type !== 'media' || !srcValue) return;
        const ext = srcValue.split('.').pop().toLowerCase();
        if (!ALLOWED_IMG_EXT.includes(ext)) {
            setError('src', { type: 'custom', message: 'Enter a valid image URL' });
            setCanSave(false);
        } else {
            clearErrors('src');
            setCanSave(true);
        }
    }, [srcValue, type, setError, clearErrors]);

    const handleSave = handleSubmit((data) => {
        reset();
        onSave(data);
    });

    const handleModalClose = () => {
        reset();
        setCanSave(true);
        handleClose();
    };

    return (
        <RSModal
            size="md"
            show={show}
            header={type === 'browse' ? 'Upload image' : 'Image URL'}
            handleClose={handleModalClose}
            body={
                <Container className='px0'>
                    {type === 'media' && (
                        <div className="form-group mb30">
                            <Row>
                                <Col md={12}>
                                    <RSInput
                                        control={control}
                                        label="Image URL"
                                        name="src"
                                        required
                                        rules={{
                                            required: MESSAGES.ENTER_IMAGE_URL,
                                            validate: validateImageUrl,
                                        }}
                                    />
                                    <small>
                                        {MESSAGES.ALLOWED_FORMATS} {MESSAGES.JPG_PNG}
                                    </small>
                                </Col>
                            </Row>
                        </div>
                    )}

                    <div className="form-group">
                        <Row>
                            <Col md={12}>
                                <RSInput
                                    control={control}
                                    label="Alternate text"
                                    name="altText"
                                    required
                                    rules={{ required: MESSAGES.ENTER_ALT_TEXT }}
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="form-group">
                        <Row>
                            <Col md={12}>
                                <RSInput control={control} label="Title" name="title" />
                            </Col>
                        </Row>
                    </div>

                    <div className="form-group">
                        <Row>
                            <Col md={12}>
                                <RSInput
                                    text="number"
                                    label="Height"
                                    control={control}
                                    name="height"
                                    onKeyDown={onlyNumbers}
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="form-group mb0">
                        <Row>
                            <Col md={12}>
                                <RSInput
                                    text="number"
                                    label="Width"
                                    control={control}
                                    name="width"
                                    onKeyDown={onlyNumbers}
                                />
                            </Col>
                        </Row>
                    </div>

                    {type === 'browse' && (
                        <div className="mt41">
                            <Row>
                                <Col md={12}>
                                    <RSFileUpload
                                        isbase64
                                        control={control}
                                        name="src"
                                        accept=".jpg,jpeg,.png,svg"
                                        isPrefix
                                        clearErrors={clearErrors}
                                        setError={setError}
                                        size={1000000}
                                        rules={{ required: MESSAGES.UPLOAD_FILE }}
                                        required
                                        watch={watch}
                                    />
                                    <small className="position-relative">
                                        {MESSAGES.ALLOWED_FORMATS} {MESSAGES.JPG_PNG_JPEG}
                                    </small>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Container>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={handleModalClose}>
                        {MESSAGES.CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={canSave ? '' : 'click-off'}
                        onClick={handleSave}
                    >
                        {MESSAGES.SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

InsertImageModal.propTypes = {
    show: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['media', 'browse']),
    handleClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default InsertImageModal;
