import { WEBSITE_RULES } from 'Constants/GlobalConstant/Rules';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { ALLOWED_FORMATS, CANCEL, FILE_NAME_EXTENSIONS_JPG_PNG, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';


import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Row, Col, Container } from 'react-bootstrap';
import { ENTER_ALT_TEXT, UPLOAD_FILE, ENTER_IMAGE_URL } from 'Constants/GlobalConstant/ValidationMessage';

const UploadModal = ({ show, type, handleClose, onSave }) => {
    const { control, clearErrors, setError, reset, handleSubmit, watch } = useForm();
    const srcname = watch('src');
    const [showSave, setShowSave] = useState(true);
    useEffect(() => {
        if (type === 'media' && srcname?.length > 0) {
            let urlTypeValue = srcname?.split('.')?.pop();
            var allowedExtensions_img = ['png', 'jpg', 'jpeg']; ///^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg)\??.*$/gim;
            var test_url_img = allowedExtensions_img.includes(urlTypeValue.toLowerCase());
            if (!test_url_img) {
                setError(`src`, {
                    type: 'custom',
                    message: 'Enter valid URL',
                });
                setShowSave(false);
                return;
            } else {
                setShowSave(true);
                clearErrors('src');
            }
        }
    }, [srcname]);

    return (
        <RSModal
            size="md"
            show={show}
            header={type === 'browse' ? 'Upload image' : 'Image URL'}
            handleClose={handleClose}
            body={
                <Container>
                     {type === 'media' && (
                        <div className="form-group mb30">
                            <Row>
                                <Col md={12}>
                                    <RSInput
                                        control={control}
                                        label={'Image URL'}
                                        required
                                        name={'src'}
                                        // rules={WEBSITE_RULES}
                                        rules={{
                                            required: ENTER_IMAGE_URL,
                                            validate: (val) => {
                                                let urlTypeValue = val?.split('.')?.pop();
                                                                                                let allowedExtensions_img = ['png', 'jpg', 'jpeg']; 
                                                let test_url_img = allowedExtensions_img.includes(urlTypeValue.toLowerCase());
                                                if (!test_url_img) {  
                                                    return 'Enter valid url';
                                                } 
                                                return true;
                                            }
                                        }}
                                    />
                                    <small>{ALLOWED_FORMATS} {FILE_NAME_EXTENSIONS_JPG_PNG}</small>
                                </Col>
                            </Row>
                        </div>
                    )}
                    <div className="form-group">
                        <Row>
                            <Col md={12}>
                                <RSInput
                                    control={control}
                                    label={'Alternate text'}
                                    name={'altText'}
                                    required
                                    rules={{
                                        required: ENTER_ALT_TEXT,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col md={12}>
                                <RSInput control={control} label={'Title'} name={'title'} />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col md={12}>
                                <RSInput
                                    text="number"
                                    label={'Height'}
                                    control={control}
                                    name={'height'}
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
                                    control={control}
                                    label={'Width'}
                                    name={'width'}
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
                                        name={'src'}
                                        accept=".jpg,jpeg,.png,svg"
                                        isPrefix
                                        clearErrors={clearErrors}
                                        setError={setError}
                                        size={1000000}
                                        rules={{
                                            required: UPLOAD_FILE,
                                        }}
                                        required
                                        watch={watch}
                                        // isUpload={true}
                                    />
                                    <small className="position-relative">{ALLOWED_FORMATS} {FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1}</small>
                                </Col>
                                {/* <Col md={1}>
                                <RSTooltip text={'Only .jpg, .png files are allowed'}>
                                    <i className={`${circle_question_mark_mini} icon-xs color-primary-blue`} />
                                </RSTooltip>
                            </Col> */}
                            </Row>
                        </div>
                    )}
                   
                </Container>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        className={showSave ? '' : 'click-off'}
                        onClick={handleSubmit((data) => {
                            reset();
                            onSave(data);
                        })}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default UploadModal;
