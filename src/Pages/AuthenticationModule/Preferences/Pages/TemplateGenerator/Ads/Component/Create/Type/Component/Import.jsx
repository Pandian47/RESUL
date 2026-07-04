import { DIGIPOP_AUDIO_UPLOAD, DIGIPOP_AUDIO_URL as DIGIPOP_AUDIO_URL_MSG, DIGIPOP_IAMGE_UPLOAD, DIGIPOP_IMAGE_URL as DIGIPOP_IMAGE_URL_MSG, DIGIPOP_VIDEO_UPLOAD, DIGIPOP_VIDEO_URL as DIGIPOP_VIDEO_URL_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_AUDIO_URL, DIGIPOP_IMAGE_URL, DIGIPOP_VIDEO_URL } from 'Constants/GlobalConstant/Placeholders';
import { import_file_edge_large, import_link_large, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { get as _get } from 'Utils/modules/lodashReplacements';

import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton } from 'Components/Buttons';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import Preview from '../Component/UploadURL/Preview';

const Import = ({ fieldName, type = 'image', isPreview = true, isShowRadioField = true, isRequired = true, size,isVideoImage=false }) => {
    const {
        control,
        clearErrors,
        setError,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const sourceType = watch(`digipop.type.type`)
    const fileType = `${type}Type`;
    const errorMessage = _get(errors, `${fieldName}.image.message`);
    const errorMsg = _get(errors, `${fieldName}.${type}Url`)?.message || '';
    const errorImport = watch(`${fieldName}.errorImport`);
    const imagePreview = watch(`${fieldName}.${type}Url`);
    const Importwatch = watch(`${fieldName}.selectImport`);
    const watchUploadUrl = watch(fieldName);
    const getUniqueName = (name = '') => {
        return `${fieldName}.${name}`;
    };

    const hanldeRefresh = () => {
        setValue(getUniqueName(fileType), '');
        setValue(getUniqueName('fileName'), '');
        setValue(getUniqueName(type), '');
        setValue(getUniqueName('isPreviewImageUrl'), false);
        setValue(getUniqueName('imageUrl'), '');
        setValue(getUniqueName('videoUrl'), '');
        setValue(getUniqueName('audioUrl'), '');
        setValue(getUniqueName('defaulPreview'), false);
        setValue(getUniqueName('selectImport'), false);
        // setSelectImport(false);
        clearErrors();
    };

    return (
        <div className="form-group mb0 digipop-custom-import">
            <>
                <Row>
                    {(errorImport || !!errorMessage?.length) && (
                        <Col
                            sm={8}
                            className={`pb10 color-primary-red ${
                                Importwatch && errorMessage?.length ? 'custom-error' : ''
                            }`}
                        >
                            {errorMessage?.length ? errorMessage : errorImport}
                        </Col>
                    )}
                    <Col sm={12}>
                        <div className="rs-import-block import-url-blank digipop-import">
                            <div className="form-group mb0 ">
                                {(imagePreview || watchUploadUrl  &&  watchUploadUrl  &&  watchUploadUrl[fileType]  === 'Upload') && (
                                    <div className="rs-import-refresh mr-5">
                                        <RSTooltip
                                            className="lh0 rs-tooltip-wrapper position-relative"
                                            text="Reset"
                                            position="top"
                                        >
                                            <i
                                                className={`${restart_medium} icon-md color-primary-blue`}
                                                onClick={hanldeRefresh}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                )}
                                <Row
                                    className={`rs-import-url-wrapper mb10 mx0 ${
                                        Importwatch ? 'active-url' : 'active'
                                    }`}
                                >
                                    <Col
                                        sm={2}
                                        className={`rsiuw-1 text-center p0 ${
                                            Importwatch && errorMessage?.length ? 'click-off pointer-event-none' : ''
                                        }  ${watchUploadUrl  &&  watchUploadUrl[fileType]  === 'Upload' ? 'click-off' : ''}  ${errorMsg?.length ? 'pe-none': ''} `}
                                        onClick={() => {
                                            setValue(getUniqueName('selectImport'), false);
                                            // setSelectImport(false);
                                            clearErrors();
                                        }}
                                    >
                                        <div className={`rsiuw-holder position-relative top4 `}>
                                            <i className={`${import_link_large} icon-lg color-primary-blue `}></i>
                                            <label className="control-label-left cp">
                                                {type.charAt(0).toUpperCase() + type.slice(1)} URL
                                            </label>
                                        </div>
                                    </Col>
                                    <Col sm={5} className={`rsiuw-2 ${Importwatch ? 'd-none' : ''}`}>
                                        <>
                                            {type === 'image' && watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'Upload' ? (
                                                <RSInput
                                                    control={control}
                                                    name={getUniqueName(`${type}Url`)}
                                                    placeholder={DIGIPOP_IMAGE_URL}
                                                    required={isVideoImage ? false : true}
                                                    rules={isVideoImage ? {} :{
                                                        required: DIGIPOP_IMAGE_URL_MSG,
                                                        validate: (val) => {
                                                            let urlTypeValue = val?.split('.')?.pop();
                                                            let allowedExtensions = ['gif', 'jpg', 'jpeg'];
                                                            let isValid = allowedExtensions.includes(
                                                                urlTypeValue?.toLowerCase(),
                                                            );
                                                            if (!isValid && watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'Upload') {
                                                                return 'Enter valid URL';
                                                            }
                                                            return true;
                                                        },
                                                    }}
                                                    handleOnchange={() => {
                                                        setValue(getUniqueName('errorImport'), '');
                                                    }}
                                                />
                                            ) : type === 'audio' && watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'Upload' ? (
                                                <RSInput
                                                    control={control}
                                                    name={getUniqueName(`${type}Url`)}
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
                                            ) : type === 'video' && watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'Upload' ? (
                                                <RSInput
                                                    control={control}
                                                    name={getUniqueName(`${type}Url`)}
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
                                                            if (!isValid && watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'Upload') {
                                                                return 'Enter valid URL';
                                                            }
                                                            return true;
                                                        },
                                                    }}
                                                />
                                            ) : null}
                                        </>
                                    </Col>
                                    <Col sm={2} className={`pl0 rsiuw-3 ${Importwatch ? 'd-none' : ''}`}>
                                        <RSPrimaryButton
                                            onClick={() => {
                                                setValue(getUniqueName(`${type}Type`), 'URL');
                                                setValue(getUniqueName('isPreviewImageUrl'), true);
                                                setValue(getUniqueName('errorImport'), '');
                                            }}
                                            className={`${imagePreview?.length ? '' : 'click-off'} ${errorMsg?.length ? 'click-off' : ''}`}
                                        >
                                            Go
                                        </RSPrimaryButton>
                                    </Col>
                                    <Col sm={Importwatch ? 10 : 3} className="pr0 rsiuw-4 digipopup-import">
                                        <div
                                            className={`or-sep rs-import-with-icon ${
                                                Importwatch ? 'active-import position-relative' : ''
                                            } ${imagePreview ? 'click-off' : ''}`}
                                            onClick={() => {
                                                setValue(getUniqueName('selectImport'), true);
                                                // setSelectImport(true);
                                                setValue(getUniqueName(`${type}Type`), 'Upload');
                                                setValue(getUniqueName('defaulPreview'), true);
                                            }}
                                        >
                                            <div className="import-zip-file-tab text-center position-relative top4">
                                                <div className="rsiwi-icon d-grid pointer-event-none">
                                                    <i
                                                        className={`${import_file_edge_large} icon-lg color-primary-blue `}
                                                    ></i>

                                                    <label className="rsiwi-label">Upload {type}</label>
                                                </div>
                                                <span className="opacity-0  position-absolute">
                                                    {type === 'image' && watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'URL' ? (
                                                        <RSFileUpload
                                                            control={control}
                                                            name={getUniqueName('image')}
                                                            id="digipopImage"
                                                            text="Upload"
                                                            placeholder={watchUploadUrl?.fileName || 'Upload image'}
                                                            accept={'.jpg,.gif,.jpeg,.png'}
                                                            clearErrors={clearErrors}
                                                            setError={setError}
                                                            required={isVideoImage ? false : true}
                                                            rules={isVideoImage ? {}:{
                                                                required: DIGIPOP_IAMGE_UPLOAD,
                                                            }}
                                                            isbase64
                                                            watch={watch}
                                                            size={sourceType === 'meta' || sourceType === 'pushnotif' ?  2097152: 204800}
                                                            isPrefix
                                                            fileType="img"
                                                            handleChange={() => {
                                                                setValue(getUniqueName('errorImport'), '');
                                                            }}
                                                        />
                                                    ) : type === 'video' && watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'URL' ? (
                                                        <RSFileUpload
                                                            control={control}
                                                            name={getUniqueName('video')}
                                                            accept={
                                                                '.mp4,.avi,.mov,.mkv'
                                                            }
                                                            setError={setError}
                                                            clearErrors={clearErrors}
                                                            size={157286400}
                                                            required
                                                            rules={{
                                                                required: DIGIPOP_VIDEO_UPLOAD,
                                                            }}
                                                            watch={watch}
                                                            placeholder={watchUploadUrl?.fileName || 'Upload video'}
                                                            isbase64
                                                        />
                                                    ) : (
                                                        watchUploadUrl  &&  watchUploadUrl[fileType]  !== 'URL' && (
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
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </>

            {isPreview && <Preview fieldName={fieldName} type={type} size={size} />}
        </div>
    );
};

export default Import;
