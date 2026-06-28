import { DIGIPOP_AUDIO_UPLOAD, DIGIPOP_AUDIO_URL as DIGIPOP_AUDIO_URL_MSG, DIGIPOP_IAMGE_UPLOAD, DIGIPOP_IMAGE_URL as DIGIPOP_IMAGE_URL_MSG, DIGIPOP_VIDEO_UPLOAD, DIGIPOP_VIDEO_URL as DIGIPOP_VIDEO_URL_MSG, SELECT_SOURCE } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_AUDIO_URL, DIGIPOP_IMAGE_URL, DIGIPOP_VIDEO_URL, URL } from 'Constants/GlobalConstant/Placeholders';
import { eye_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import Preview from './Preview';
import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';

const UploadURL = ({
    fieldName,
    type = 'image',
    isPreview = true,
    isShowRadioField = true,
    isRequired = true,
    size,
}) => {
    const { control, clearErrors, setError, watch, setValue } = useFormContext();

    const fileType = `${type}Type`;

    const watchUploadUrl = watch(fieldName);
    const [modalShow, setModalShow] = useState(false);

    const getUniqueName = (name = '') => {
        return `${fieldName}.${name}`;
    };

    const handleClearError = () => {
        setValue(getUniqueName(type), '');
        clearErrors(getUniqueName(type));
    };

    const hanldeRefresh = () => {
        setValue(getUniqueName(fileType), '');
        setValue(getUniqueName('fileName'), '');
        setValue(getUniqueName(type), '');
        clearErrors(getUniqueName(type));
    };
    return (
        <div>
            {isShowRadioField && (
                <Row>
                    <div>
                        <div className={`form-group ${watchUploadUrl[fileType] ? '' : 'mb0'}`}>
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }} className="mt5">
                                    <label className="control-label-left">{size}</label>
                                </Col>
                                <Col md={2}>
                                    <RSRadioButton
                                        control={control}
                                        name={getUniqueName(fileType)}
                                        id={`${fieldName}_upload`}
                                        labelName="Upload"
                                        rules={{
                                            required: SELECT_SOURCE,
                                        }}
                                    />
                                </Col>
                                <Col sm={1}>
                                    <div className={`form-group`}>
                                        <RSRadioButton
                                            control={control}
                                            name={getUniqueName(fileType)}
                                            id={`${fieldName}_url`}
                                            labelName={URL}
                                            rules={{
                                                required: SELECT_SOURCE,
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col sm={1}>
                                    {watchUploadUrl[fileType] && (
                                        <div className="d-flex">
                                            <RSTooltip
                                                className="lh0 rs-tooltip-wrapper position-relative top10"
                                                text="Reset"
                                                position="top"
                                            >
                                                <i
                                                    className={`${restart_medium} icon-sm color-primary-blue`}
                                                    onClick={hanldeRefresh}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    )}
                                </Col>
                                <Col sm={1}>
                                    {watchUploadUrl[fileType] && (
                                        <div className="d-flex">
                                            <RSPPophover
                                                position="left"
                                                image={
                                                    'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg'
                                                }
                                            >
                                                <RSTooltip
                                                    className="lh0 rs-tooltip-wrapper position-relative top7"
                                                    text="Preview"
                                                    position="top"
                                                >
                                                    <i
                                                        className={`${eye_medium} icon-md color-primary-blue`}
                                                        onClick={() => {
                                                            setModalShow(() => true);
                                                        }}
                                                    ></i>
                                                </RSTooltip>
                                            </RSPPophover>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Row>
            )}
            {watchUploadUrl[fileType] === 'Upload' ? (
                <Row>
                    <Col
                        sm={{ offset: 3, span: 6 }}
                        className={watchUploadUrl[fileType] === 'Upload' ? 'mb30 mt-50' : ''}
                    >
                        {type === 'image' ? (
                            <RSFileUpload
                                control={control}
                                name={getUniqueName('image')}
                                id="digipopImage"
                                text="Upload"
                                placeholder={watchUploadUrl?.fileName || 'Upload image'}
                                accept={'.jpg,.gif,.jpeg'}
                                clearErrors={clearErrors}
                                setError={setError}
                                required
                                rules={{
                                    required: DIGIPOP_IAMGE_UPLOAD,
                                }}
                                isbase64
                                watch={watch}
                                size={100000}
                                isPrefix
                                fileType="img"
                            />
                        ) : type === 'video' ? (
                            <RSFileUpload
                                control={control}
                                name={getUniqueName('video')}
                                accept={'.mp4,.avi,.mov,.mkv,.wmv,.flv,.webm,.mpeg,.mpg,.mp3'}
                                setError={setError}
                                clearErrors={clearErrors}
                                size={5000000}
                                required
                                rules={{
                                    required: DIGIPOP_VIDEO_UPLOAD,
                                }}
                                watch={watch}
                                placeholder={watchUploadUrl?.fileName || 'Upload video'}
                                isbase64
                            />
                        ) : (
                            <RSFileUpload
                                control={control}
                                name={getUniqueName('audio')}
                                accept={'.mp3'}
                                setError={setError}
                                clearErrors={clearErrors}
                                size={5000000}
                                required
                                rules={{
                                    required: DIGIPOP_AUDIO_UPLOAD,
                                }}
                                watch={watch}
                                placeholder={watchUploadUrl?.fileName || 'Upload audio'}
                                isbase64
                            />
                        )}
                    </Col>
                </Row>
            ) : (
                <>
                    {' '}
                    <Row>
                        <Col sm={{ offset: 3, span: 6 }}>
                            <div className={watchUploadUrl[fileType] === 'URL' ? 'mb30 mt-50' : ''}>
                                {watchUploadUrl[fileType] &&
                                    (type === 'image' ? (
                                        <RSInput
                                            control={control}
                                            name={getUniqueName(type)}
                                            placeholder={DIGIPOP_IMAGE_URL}
                                            required
                                            rules={{
                                                required: DIGIPOP_IMAGE_URL_MSG,
                                                validate: (val) => {
                                                    let urlTypeValue = val?.split('.')?.pop();
                                                    let allowedExtensions = ['gif', 'jpg', 'jpeg'];
                                                    let isValid = allowedExtensions.includes(
                                                        urlTypeValue?.toLowerCase(),
                                                    );
                                                    if (!isValid && watchUploadUrl[fileType] !== 'Upload') {
                                                        return 'Enter valid URL';
                                                    }
                                                    return true;
                                                },
                                            }}
                                        />
                                    ) : type === 'audio' ? (
                                        <RSInput
                                            control={control}
                                            name={getUniqueName(type)}
                                            placeholder={DIGIPOP_AUDIO_URL}
                                            required
                                            rules={{
                                                required: DIGIPOP_AUDIO_URL_MSG,
                                                validate: (val) => {
                                                    let urlTypeValue = val?.split('.')?.pop();
                                                    let allowedExtensions = ['mp3'];
                                                    let isValid = allowedExtensions.includes(
                                                        urlTypeValue?.toLowerCase(),
                                                    );
                                                    if (!isValid && watchUploadUrl[fileType] !== 'Upload') {
                                                        return 'Enter valid URL';
                                                    }
                                                    return true;
                                                },
                                            }}
                                        />
                                    ) : type === 'video' ? (
                                        <RSInput
                                            control={control}
                                            name={getUniqueName(type)}
                                            placeholder={DIGIPOP_VIDEO_URL}
                                            required
                                            rules={{
                                                required: DIGIPOP_VIDEO_URL_MSG,
                                                validate: (val) => {
                                                    let urlTypeValue = val?.split('.')?.pop();
                                                    let allowedExtensions = ['mp4'];
                                                    let isValid = allowedExtensions.includes(
                                                        urlTypeValue?.toLowerCase(),
                                                    );
                                                    if (!isValid && watchUploadUrl[fileType] !== 'Upload') {
                                                        return 'Enter valid URL';
                                                    }
                                                    return true;
                                                },
                                            }}
                                        />
                                    ) : null)}
                            </div>
                        </Col>{' '}
                    </Row>
                </>
            )}

            {isPreview && (
                <Preview
                    fieldName={fieldName}
                    type={type}
                    show={modalShow}
                    handleClose={() => {
                        setModalShow(false);
                    }}
                    size={size}
                />
            )}
        </div>
    );
};

export default UploadURL;
