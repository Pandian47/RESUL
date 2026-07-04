import { truncateTitle } from 'Utils/modules/displayCore';
import { DIGIPOP_AUDIO_UPLOAD, DIGIPOP_IAMGE_UPLOAD, DIGIPOP_PDF_UPLOAD, DIGIPOP_VIDEO_UPLOAD } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_AUDIO_URL, DIGIPOP_IMAGE_URL, DIGIPOP_PDF_URL, DIGIPOP_VIDEO_URL } from 'Constants/GlobalConstant/Placeholders';
import { import_file_edge_large, import_link_large, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { get as _get } from 'Utils/modules/lodashReplacements';

import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton } from 'Components/Buttons';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { uploadMessagingImage } from 'Reducers/communication/createCommunication/Create/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';


const Import = ({
    fieldName,
    type = 'image',
    isPreview = true,
    isShowRadioField = true,
    isRequired = true,
    size,
    isVideoImage = false,
    CustomType = type,
}) => {
    const {
        control,
        clearErrors,
        setError,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const uploadLoader = useApiLoader({ autoFetch: false });    const watcher = watch();
    const isEditable = true;
    const required = isRequired;

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
    const isClickOff = false;
    const hanldeRefresh = () => {
        setValue(getUniqueName(fileType), '');
        setValue(getUniqueName('fileName'), '');
        setValue(getUniqueName(type), '');
        setValue(getUniqueName(`${type}Url`), '');
        setValue(getUniqueName('isPreviewImageUrl'), false);
        setValue(getUniqueName('imageUrl'), '');
        setValue(getUniqueName('videoUrl'), '');
        setValue(getUniqueName('audioUrl'), '');
        setValue(getUniqueName(`${type}UploadUrl`), '');
        setValue(getUniqueName('defaulPreview'), false);
        setValue(getUniqueName('selectImport'), false);
        setValue(getUniqueName('errorImport'), '');
        setValue('previewImage', '');
        // setSelectImport(false);
        clearErrors();
    };

    const handleUploadApi = async ({ base64, fileName, contentLength }) => {
        const payloadData = {
            base64Image: base64,
            imageFormat: fileName.split('.')?.pop(),
            contentLength,
            departmentId,
            clientId,
            userId,
            fileName: fileName,
        };
        const { data, status } =
            (await uploadLoader.refetch({
                fetcher: ({ payload: uploadPayload } = {}) =>
                    dispatch(uploadMessagingImage({ payload: uploadPayload, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload: payloadData },
            })) || {};
        if (status) {
            setValue(getUniqueName(`${type}Url`), data);
        }
    };
    const handleRequire = (error) => {
        if (required) {
            return error || 'Enter url';
        } else {
            return true;
        }
    };
    const handleSize = (mediaSize) => {
        if (mediaSize) {
            return mediaSize;
        } else {
            return size || 204800; // 200kb;
        }
    };

    const handleImagePreview = () => {
        if (!watchUploadUrl?.selectImport && watchUploadUrl?.isPreviewImageUrl && watchUploadUrl?.imageUrl) {
            return (
                <div className="box-design shadow-none p5">
                    <img src={watchUploadUrl?.imageUrl} />
                </div>
            );
        } else if (watchUploadUrl?.selectImport && watchUploadUrl?.imageUrl) {
            return (
                <div className="box-design shadow-none p5">
                    <img src={watchUploadUrl?.imageUrl} />
                </div>
            );
        } else {
            return null;
        }
    };


    return (
        <>
            <div className={`form-group mb0 mt41 ${isEditable ? '' : 'click-off pe-none'}`}>
                <>
                    <Row>
                        <label className='control-label-left'>Thumbnail URL</label>

                        <Col sm={{ offset: 0, span: 12 }} className={`position-relative  ${watch(fieldName)?.[`${type}Url`] && watch(getUniqueName('selectImport')) ? 'my20' : ''}`}>
                            {(errorImport || !!errorMessage?.length) && (
                                <small
                                    className={`color-primary-red ${Importwatch && errorMessage?.length ? 'custom-error' : ''
                                        }`}
                                >
                                    {errorMessage?.length ? errorMessage : errorImport}
                                </small>
                            )}
                            <div
                                className={`${(watchUploadUrl?.selectImport && watchUploadUrl?.imageUrl) ||
                                        (!watchUploadUrl?.selectImport &&
                                            watchUploadUrl?.imageUrl &&
                                            watchUploadUrl?.isPreviewImageUrl)
                                        ? 'd-flex thumbnail-url-preview-wrpper col-sm-12 justify-content-between'
                                        : ''
                                    }`}
                            >
                                <div className="rs-import-block import-url-blank digipop-import w-100">
                                    <div className="form-group mb0 position-relative">
                                        <Row
                                            className={`rs-import-url-wrapper mx0  justify-content-between ${Importwatch ? 'active-url' : 'active'
                                                } ${type !== 'image' ? 'py15' : ''}  `}
                                        >
                                            {Importwatch && (
                                                <Col
                                                    sm={4}
                                                    className={`rsiuw-1 text-center px5   ${errorMsg?.length ? 'pe-none' : ''
                                                        } ${Importwatch ? 'pe-none click-off' : ''} `}
                                                    onClick={() => {
                                                        if (Importwatch) return;
                                                        // Don't set selectImport to false here to avoid state conflicts
                                                        // setValue(getUniqueName('selectImport'), false);
                                                        clearErrors();
                                                    }}
                                                >
                                                    <div className={`rsiuw-holder position-relative top4 `}>
                                                        <i
                                                            className={`${import_link_large} icon-lg color-primary-blue `}
                                                        ></i>
                                                        <label className="control-label-left cp text-center">
                                                            {CustomType.charAt(0).toUpperCase() + CustomType.slice(1)} URL
                                                        </label>
                                                    </div>
                                                </Col>
                                            )}


                                            {!Importwatch && (
                                                <Col sm={type !== 'image' ? 9 : 6} >
                                                    <>
                                                        {type === 'image' &&
                                                            watchUploadUrl &&
                                                            watchUploadUrl[fileType] !== 'Upload' ? (


                                                            <RSInput
                                                                control={control}
                                                                name={getUniqueName(`${type}Url`)}
                                                                placeholder={DIGIPOP_IMAGE_URL}
                                                                required={false}
                                                                // rules={
                                                                //     required
                                                                //         ? {}
                                                                //         : {
                                                                //               required: handleRequire(
                                                                //                   DIGIPOP_IMAGE_URL,
                                                                //               ),
                                                                //               validate: (val) => {
                                                                //                   let urlTypeValue = val?.split('.')?.pop();
                                                                //                   let allowedExtensions = [
                                                                //                       'gif',
                                                                //                       'jpg',
                                                                //                       'jpeg',
                                                                //                   ];
                                                                //                   let isValid = allowedExtensions.includes(
                                                                //                       urlTypeValue?.toLowerCase(),
                                                                //                   );
                                                                //                   if (
                                                                //                       !isValid &&
                                                                //                       watchUploadUrl &&
                                                                //                       watchUploadUrl[fileType] !== 'Upload'
                                                                //                   ) {
                                                                //                       return 'Enter valid URL';
                                                                //                   }
                                                                //                   return true;
                                                                //               },
                                                                //           }
                                                                // }
                                                                handleOnchange={() => {
                                                                    setValue(getUniqueName('errorImport'), '');
                                                                }}
                                                            />
                                                        ) : type === 'audio' &&
                                                            watchUploadUrl &&
                                                            watchUploadUrl[fileType] !== 'Upload' ? (
                                                            <RSInput
                                                                control={control}
                                                                name={getUniqueName(`${type}Url`)}
                                                                placeholder={DIGIPOP_AUDIO_URL}
                                                                required={required}
                                                                rules={{
                                                                    required: handleRequire(DIGIPOP_AUDIO_URL),
                                                                    validate: (val) => {
                                                                        let urlTypeValue = val?.split('.')?.pop();
                                                                        let allowedExtensions = ['mp3'];
                                                                        let isValid = allowedExtensions.includes(
                                                                            urlTypeValue?.toLowerCase(),
                                                                        );
                                                                        if (
                                                                            !isValid &&
                                                                            watchUploadUrl[fileType] !== 'Upload'
                                                                        ) {
                                                                            return 'Enter valid URL';
                                                                        }
                                                                        return true;
                                                                    },
                                                                }}
                                                            />
                                                        ) : type === 'video' &&
                                                            watchUploadUrl &&
                                                            watchUploadUrl[fileType] !== 'Upload' ? (
                                                            <RSInput
                                                                control={control}
                                                                name={getUniqueName(`${type}Url`)}
                                                                placeholder={DIGIPOP_VIDEO_URL}
                                                                required={required}
                                                                rules={{
                                                                    required: handleRequire(DIGIPOP_VIDEO_URL),
                                                                    validate: (val) => {
                                                                        let urlTypeValue = val?.split('.')?.pop();
                                                                        let allowedExtensions = ['mp4'];
                                                                        let isValid = allowedExtensions.includes(
                                                                            urlTypeValue?.toLowerCase(),
                                                                        );
                                                                        if (
                                                                            !isValid &&
                                                                            watchUploadUrl &&
                                                                            watchUploadUrl[fileType] !== 'Upload'
                                                                        ) {
                                                                            return 'Enter valid URL';
                                                                        }
                                                                        return true;
                                                                    },
                                                                }}
                                                            />
                                                        ) : (type === 'pdf' || type === 'docs') &&
                                                            watchUploadUrl &&
                                                            watchUploadUrl[fileType] !== 'Upload' ? (
                                                            <RSInput
                                                                control={control}
                                                                name={getUniqueName(`${type}Url`)}
                                                                placeholder={DIGIPOP_PDF_URL}
                                                                required={required}
                                                                rules={{
                                                                    required: handleRequire(DIGIPOP_PDF_URL),
                                                                    validate: (val) => {
                                                                        let urlTypeValue = val?.split('.')?.pop();
                                                                        let allowedExtensions = ['pdf'];
                                                                        let isValid = allowedExtensions.includes(
                                                                            urlTypeValue?.toLowerCase(),
                                                                        );
                                                                        if (
                                                                            !isValid &&
                                                                            watchUploadUrl &&
                                                                            watchUploadUrl[fileType] !== 'Upload'
                                                                        ) {
                                                                            return 'Enter valid URL';
                                                                        }
                                                                        return true;
                                                                    },
                                                                }}
                                                            />
                                                        ) : null}
                                                    </>
                                                </Col>
                                            )}
                                            {!Importwatch && (
                                                <Col
                                                    sm={2}
                                                    className={`pl0 rsiuw-3 ${errors?.[fieldName]?.[`${type}Url`]?.message ||
                                                            watch(getUniqueName('isPreviewImageUrl')) ||
                                                            !watch(getUniqueName(`${type}Url`))
                                                            ? 'click-off pe-none'
                                                            : ''
                                                        } ${Importwatch ? 'd-none' : ''}  `}
                                                >
                                                    <RSPrimaryButton
                                                        onClick={() => {
                                                            setValue(getUniqueName(`${type}Type`), 'URL');
                                                            setValue(getUniqueName('isPreviewImageUrl'), true);
                                                            setValue(getUniqueName('errorImport'), '');
                                                            setValue(getUniqueName(`${type}Url`), data);
                                                        }}
                                                        className={''}
                                                    >
                                                        Go
                                                    </RSPrimaryButton>
                                                </Col>
                                            )}

                                            <Col
                                                sm={Importwatch ? 8 : 4}
                                                className={`pr0 rsiuw-4 d-flex position-relative ${type !== 'image' ? 'd-none' : ''
                                                    } ${Importwatch ? 'pl0' : ''} ${uploadLoader.isLoading ? 'pe-none click-off' : ''}`}
                                            >                                                <div
                                                    className={`or-sep rs-import-with-icon ${Importwatch ? 'active-import position-relative  top4' : ''
                                                        } `}
                                                    onClick={() => {
                                                        if (
                                                            watch(getUniqueName('isPreviewImageUrl')) &&
                                                            watcher?.[fieldName]?.[`${type}Url`]
                                                        ) {
                                                            return;
                                                        }
                                                        setValue(getUniqueName('selectImport'), true);
                                                        // setSelectImport(true);
                                                        setValue(getUniqueName(`${type}Type`), 'Upload');
                                                        setValue(getUniqueName('defaulPreview'), true);
                                                    }}
                                                >
                                                    <div className="import-zip-file-tab text-center position-relative ">
                                                        <div
                                                            className={`rsiwi-icon d-grid pointer-event-none ${watch(getUniqueName('isPreviewImageUrl')) &&
                                                                    watcher?.[fieldName]?.[`${type}Url`]
                                                                    ? 'click-off pe-none'
                                                                    : ''
                                                                } ${Importwatch ? '' : ''}`}
                                                        >
                                                            <i
                                                                className={`${import_file_edge_large} icon-lg color-primary-blue `}
                                                            ></i>

                                                            <label className="rsiwi-label">Upload {type}</label>
                                                        </div>
                                                        <span className="opacity-0  position-absolute right10 top3">
                                                            {type === 'image' &&
                                                                watchUploadUrl &&
                                                                watchUploadUrl[fileType] !== 'URL' ? (
                                                                <RSFileUpload
                                                                    control={control}
                                                                    name={getUniqueName('image')}
                                                                    id="digipopImage"
                                                                    text="Upload"
                                                                    placeholder={watchUploadUrl?.fileName || 'Upload image'}
                                                                    accept={'.jpg,.gif,.jpeg,.png'}
                                                                    clearErrors={clearErrors}
                                                                    setError={setError}
                                                                    required={required}
                                                                    rules={
                                                                        !required
                                                                            ? {}
                                                                            : {
                                                                                required: DIGIPOP_IAMGE_UPLOAD,
                                                                            }
                                                                    }
                                                                    isbase64
                                                                    watch={watch}
                                                                    size={handleSize(watcher?.[fieldName]?.mediaSize)}
                                                                    isPrefix
                                                                    fileType="img"
                                                                    handleChange={() => {
                                                                        setValue(getUniqueName('errorImport'), '');
                                                                    }}
                                                                    base64Data={async (base64, fileName, contentLength) => {
                                                                        const uploadStatus = await handleUploadApi({
                                                                            base64,
                                                                            fileName,
                                                                            contentLength,
                                                                        });
                                                                    }}
                                                                    isBase64Status
                                                                />
                                                            ) : type === 'video' &&
                                                                watchUploadUrl &&
                                                                watchUploadUrl[fileType] !== 'URL' ? (
                                                                <RSFileUpload
                                                                    control={control}
                                                                    name={getUniqueName('video')}
                                                                    accept={'.mp4,.avi,.mov,.mkv'}
                                                                    setError={setError}
                                                                    clearErrors={clearErrors}
                                                                    size={handleSize(watcher?.[fieldName]?.mediaSize)}
                                                                    required={required}
                                                                    rules={
                                                                        !required
                                                                            ? {}
                                                                            : {
                                                                                required: DIGIPOP_VIDEO_UPLOAD,
                                                                            }
                                                                    }
                                                                    watch={watch}
                                                                    placeholder={watchUploadUrl?.fileName || 'Upload video'}
                                                                    isbase64
                                                                    base64Data={async (base64, fileName, contentLength) => {
                                                                        const uploadStatus = await handleUploadApi({
                                                                            base64,
                                                                            fileName,
                                                                            contentLength,
                                                                        });
                                                                    }}
                                                                    isBase64Status
                                                                />
                                                            ) : (type === 'pdf' || type === 'docs') &&
                                                                watchUploadUrl &&
                                                                watchUploadUrl[fileType] !== 'URL' ? (
                                                                <RSFileUpload
                                                                    control={control}
                                                                    name={getUniqueName('pdf')}
                                                                    accept={'.pdf'}
                                                                    setError={setError}
                                                                    clearErrors={clearErrors}
                                                                    size={handleSize(watcher?.[fieldName]?.mediaSize)}
                                                                    required={required}
                                                                    rules={
                                                                        !required
                                                                            ? {}
                                                                            : {
                                                                                required: DIGIPOP_PDF_UPLOAD,
                                                                            }
                                                                    }
                                                                    watch={watch}
                                                                    placeholder={watchUploadUrl?.fileName || 'Upload  pdf'}
                                                                    isbase64
                                                                    base64Data={async (base64, fileName, contentLength) => {
                                                                        const uploadStatus = await handleUploadApi({
                                                                            base64,
                                                                            fileName,
                                                                            contentLength,
                                                                        });
                                                                    }}
                                                                    isBase64Status
                                                                />
                                                            ) : (
                                                                watchUploadUrl &&
                                                                watchUploadUrl[fileType] !== 'URL' && (
                                                                    <RSFileUpload
                                                                        control={control}
                                                                        name={getUniqueName('audio')}
                                                                        accept={'.mp3'}
                                                                        setError={setError}
                                                                        clearErrors={clearErrors}
                                                                        size={handleSize(watcher?.[fieldName]?.mediaSize)}
                                                                        required={required}
                                                                        rules={
                                                                            !required
                                                                                ? {}
                                                                                : {
                                                                                    required: DIGIPOP_AUDIO_UPLOAD,
                                                                                }
                                                                        }
                                                                        watch={watch}
                                                                        placeholder={
                                                                            watchUploadUrl?.fileName || 'Upload audio'
                                                                        }
                                                                        isbase64
                                                                        base64Data={async (
                                                                            base64,
                                                                            fileName,
                                                                            contentLength,
                                                                        ) => {
                                                                            const uploadStatus = await handleUploadApi({
                                                                                base64,
                                                                                fileName,
                                                                                contentLength,
                                                                            });
                                                                        }}
                                                                        isBase64Status
                                                                    />
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                    {uploadLoader.isLoading && (
                                                        <span
                                                            className="d-inline-flex align-items-center justify-content-center position-absolute"
                                                            style={{ right: 15, top: 35 }}
                                                        >
                                                            <span className="segment_loader"></span>
                                                        </span>
                                                    )}
                                                </div>                                                {watch(fieldName)?.[`${type}Url`] && watch(getUniqueName('selectImport')) && (
                                                <Col className="active-import col  py34 rs-import-with-icon rsiuw-4 border-0 import-url-text-wrapper">
                                                    {/* <span>
                                                        <RSTooltip text={watch(fieldName)?.[`${type}Url`]}>
                                                            {truncateTitle(watch(fieldName)?.[`${type}Url`], 15)}
                                                        </RSTooltip>
                                                    </span> */}
                                                </Col>
                                            )}
                                            </Col>

                                            
                                        </Row>
                                    </div>
                                </div>
                                {handleImagePreview()}
                                {(imagePreview ||
                                    (watchUploadUrl && watchUploadUrl && watchUploadUrl[fileType] === 'Upload')) && (
                                        <div
                                            className={`rs-import-refresh position-absolute Left100  ${isEditable ? '' : 'd-none'
                                                } ${watch(fieldName)?.[`${type}Url`] && watch(getUniqueName('selectImport')) ? '' : ''}`}
                                        >
                                            <RSTooltip
                                                className="lh0 rs-tooltip-wrapper position-relative w-75"
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
                            </div>
                        </Col>
                    </Row>
                </>
            </div>
        </>

    );
};

export default Import;
