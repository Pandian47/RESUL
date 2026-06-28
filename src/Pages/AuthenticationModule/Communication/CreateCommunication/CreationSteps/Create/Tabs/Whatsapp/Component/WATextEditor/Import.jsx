import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { DIGIPOP_AUDIO_UPLOAD, DIGIPOP_IAMGE_UPLOAD, DIGIPOP_PDF_UPLOAD, DIGIPOP_VIDEO_UPLOAD } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_AUDIO_URL, DIGIPOP_IMAGE_URL, DIGIPOP_PDF_URL, DIGIPOP_VIDEO_URL } from 'Constants/GlobalConstant/Placeholders';
import { import_file_edge_large, import_link_large, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import _get from 'lodash/get';

import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton } from 'Components/Buttons';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import {
    uploadMessagingImage,
    uploadMessagingVideoDocument,
} from 'Reducers/communication/createCommunication/Create/request';
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
    isSplitFieldName = '',
    isSplitTabs = false,
}) => {
    const {
        control,
        clearErrors,
        setError,
        watch,
        setValue,
        formState: { errors },
        unregister,
    } = useFormContext();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const uploadLoader = useApiLoader({ autoFetch: false });    const watcher = isSplitFieldName ? watch(isSplitFieldName) : watch()
    const isEditable = watch(fieldName)?.isHeaderEditable;
    const getFinalFieldName = (fieldValue) =>
        isSplitFieldName && isSplitTabs ? `${isSplitFieldName}.${fieldValue}` : fieldValue;
    const getFieldNameValue = (fieldName) => watch(getFinalFieldName(fieldName));
    const sourceType = watch(`header`);
    const fileType = `${type}Type`;
    const errorMessage = _get(errors, `${fieldName}.${type}.message`);
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
        setValue(getUniqueName(fileType), 'Url');
        setValue(getUniqueName('fileName'), '');
        setValue(getUniqueName(type), '');
        setValue(getUniqueName('isPreviewImageUrl'), false);
        setValue(getUniqueName('videoUrl'), '');
        setValue(getUniqueName('audioUrl'), '');
        setValue(getFinalFieldName(`headerType.${type}UploadUrl`), '');
        setValue(getUniqueName(`${type}Url`), '');
        setValue(getUniqueName('defaulPreview'), false);
        setValue(getUniqueName('selectImport'), false);
        setValue(getFinalFieldName('previewImage'), '');
        setValue(getFinalFieldName('header'), '');
        // setSelectImport(false);
        unregister(getUniqueName('image'));
        unregister(getUniqueName('video'));
        unregister(getUniqueName('pdf'));
        unregister(getUniqueName('audio'));
        clearErrors();
    };

    const base64ToBlob = (base64String, mimeType) => {
        const base64 = base64String.replace(/^data:[^;]+;base64,/, '');
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
    };

    const getVideoMimeType = (fileName) => {
        const ext = fileName?.split('.')?.pop()?.toLowerCase() || '';
        const mimeMap = { mp4: 'video/mp4' };
        return mimeMap[ext] || 'video/mp4';
    };

    const handleUploadApi = async ({ base64, fileName, contentLength }) => {
        const setUploadError = () => {
            setError(`${fieldName}.${type}`, {
                type: 'custom',
                message: 'Exception occurs',
            });
        };

        try {
            if (type === 'video') {
                const formData = new FormData();
                const mimeType = getVideoMimeType(fileName);
                const blob = base64ToBlob(base64, mimeType);
                formData.append('file', blob, fileName);
                formData.append('departmentId', departmentId);
                formData.append('clientId', clientId);
                formData.append('userId', userId);

                const result = await dispatch(uploadMessagingVideoDocument({ payload: formData }));
                const { data, status } = result || {};
                const videoUrl = Array.isArray(data) && data[0]?.url ? data[0].url : url ?? data;
                if (status && videoUrl) {
                    setValue(getFinalFieldName(`headerType.${type}UploadUrl`), videoUrl);
                    setValue(getFinalFieldName('previewImage'), videoUrl);
                    setValue(getFinalFieldName('header'), videoUrl);
                } else {
                    setUploadError();
                }
            } else {
                const payloadData = {
                    base64Image: base64,
                    imageFormat: fileName.split('.')?.pop(),
                    fileName: fileName,
                    contentLength,
                    departmentId,
                    clientId,
                    userId,
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
                    setValue(getFinalFieldName(`headerType.${type}UploadUrl`), data);
                    setValue(getFinalFieldName('previewImage'), data);
                    setValue(getFinalFieldName('header'), data);
                } else {
                    setUploadError();
                }
            }
        } catch (err) {
            setUploadError();
        }
    };

    const handleRequire = (error) => {
        if (isEditable && !Importwatch) {
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

    const uploadTypeConfig = {
        image: {
            fieldName: 'image',
            accept: '.jpg,.gif,.jpeg,.png',
            placeholder: 'Upload image',
            errorKey: DIGIPOP_IAMGE_UPLOAD,
            id: 'digipopImage',
            text: 'Upload',
            isPrefix: true,
            fileType: 'img',
        },
        video: {
            fieldName: 'video',
            accept: '.mp4',
            placeholder: 'Upload video',
            errorKey: DIGIPOP_VIDEO_UPLOAD,
        },
        pdf: {
            fieldName: 'pdf',
            accept: '.pdf',
            placeholder: 'Upload  pdf',
            errorKey: DIGIPOP_PDF_UPLOAD,
        },
        docs: {
            fieldName: 'pdf',
            accept: '.pdf',
            placeholder: 'Upload  pdf',
            errorKey: DIGIPOP_PDF_UPLOAD,
        },
        audio: {
            fieldName: 'audio',
            accept: '.mp3',
            placeholder: 'Upload audio',
            errorKey: DIGIPOP_AUDIO_UPLOAD,
        },
    };

    const showUpload =
        watchUploadUrl && watchUploadUrl[fileType] !== 'URL';
    const uploadConfig = uploadTypeConfig[type] || uploadTypeConfig.audio;

    const eligibleMediaType = ['image', 'video', 'pdf', 'docs'];

    return (
        <div className={`form-group mb0 digipop-custom-import ${isEditable ? '' : 'click-off pe-none'}`}>
            <>
                <Row>
                    <Col sm={12}>
                        <div className="rs-import-block import-url-blank digipop-import">
                            <div className="form-group mb0 ">
                                {(imagePreview ||
                                    (watchUploadUrl && watchUploadUrl && watchUploadUrl[fileType] === 'Upload')) && (
                                        <div className={`rs-import-refresh ${isEditable ? '' : 'd-none'}`}>
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
                                    className={`rs-import-url-wrapper mx0 ${Importwatch ? 'active-url' : 'active justify-content-between'
                                        } ${eligibleMediaType.includes(type) ? '' : 'py15'}`}
                                >
                                    {Importwatch && (
                                        <Col
                                            sm={3}
                                            className={`rsiuw text-center p0  ${errorMsg?.length ? 'pe-none' : ''} ${Importwatch ? 'pe-none click-off' : ''
                                                } `}
                                            onClick={() => {
                                                if (Importwatch) return;
                                                setValue(getUniqueName('selectImport'), false);
                                                // setSelectImport(false);
                                                clearErrors();
                                            }}
                                        >
                                            <div className={`rsiuw-holder position-relative top4 `}>
                                                <i
                                                    className={`${import_link_large} icon-lg color-primary-blue `}
                                                ></i>
                                                <label className="control-label-left cp">
                                                    {type.charAt(0).toUpperCase() + type.slice(1)} URL
                                                </label>
                                            </div>
                                        </Col>
                                    )}

                                    {!Importwatch && (
                                        <Col
                                            sm={eligibleMediaType.includes(type) ? 6 : 10}
                                            className={
                                                getFieldNameValue('previewImage') && watcher?.headerType?.[`${type}Url`]
                                                    ? 'click-off pe-none'
                                                    : ''
                                            }
                                        >
                                            <>
                                                {type === 'image' &&
                                                    watchUploadUrl &&
                                                    watchUploadUrl[fileType] !== 'Upload' ? (
                                                    <RSInput
                                                        control={control}
                                                        name={getUniqueName(`${type}Url`)}
                                                        placeholder={DIGIPOP_IMAGE_URL}
                                                        required={isEditable ? true : false}
                                                        rules={
                                                            isVideoImage
                                                                ? {}
                                                                : {
                                                                    required: handleRequire(DIGIPOP_IMAGE_URL),
                                                                    validate: (val) => {
                                                                        let urlTypeValue = val?.split('.')?.pop();
                                                                        let allowedExtensions = [
                                                                            'gif',
                                                                            'jpg',
                                                                            'jpeg',
                                                                            'png',
                                                                        ];
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
                                                                }
                                                        }
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
                                                        required={isEditable ? true : false}
                                                        rules={{
                                                            required: handleRequire(DIGIPOP_AUDIO_URL),
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
                                                ) : type === 'video' &&
                                                    watchUploadUrl &&
                                                    watchUploadUrl[fileType] !== 'Upload' ? (
                                                    <RSInput
                                                        control={control}
                                                        name={getUniqueName(`${type}Url`)}
                                                        placeholder={DIGIPOP_VIDEO_URL}
                                                        required={isEditable ? true : false}
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
                                                        required={isEditable ? true : false}
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
                                            className={`pl0 rsiuw-3 ${errors?.headerType?.[`${type}Url`]?.message ||
                                                    !watcher?.headerType?.[`${type}Url`] ||
                                                    (getFieldNameValue('previewImage') && watcher?.headerType?.[`${type}Url`])
                                                    ? 'click-off pe-none'
                                                    : ''
                                                } ${Importwatch ? 'd-none' : ''}  `}
                                        >
                                            <RSPrimaryButton
                                                onClick={() => {
                                                    setValue(getUniqueName(`${type}Type`), 'URL');
                                                    setValue(getUniqueName('isPreviewImageUrl'), true);
                                                    setValue(getUniqueName('errorImport'), '');
                                                    setValue(getFinalFieldName('previewImage'), watcher?.headerType?.[`${type}Url`]);
                                                    setValue(getFinalFieldName('header'), watcher?.headerType?.[`${type}Url`]);
                                                }}
                                                className={''}
                                            >
                                                Go
                                            </RSPrimaryButton>
                                        </Col>
                                    )}

                                    <Col
                                        sm={Importwatch ? 10 : 3}
                                        className={`pr0 rsiuw-4 digipopup-import position-relative ${eligibleMediaType?.includes(type) ? '' : 'd-none'
                                            } ${Importwatch ? 'whatsapp-import-upload' : ''} ${watcher?.headerType?.[`${type}UploadUrl`] || uploadLoader.isLoading ? 'pe-none click-off' : ''
                                            } `}
                                    >                                        <div
                                            className={`or-sep rs-import-with-icon ${Importwatch ? 'active-import position-relative' : ''
                                                } `}
                                            onClick={() => {
                                                if (getFieldNameValue('previewImage') && watcher?.headerType?.[`${type}Url`]) {
                                                    return;
                                                }
                                                setValue(getUniqueName('selectImport'), true);
                                                // setSelectImport(true);
                                                setValue(getUniqueName(`${type}Type`), 'Upload');
                                                setValue(getUniqueName('defaulPreview'), true);
                                            }}
                                        >
                                            <div className="import-zip-file-tab text-center position-relative top4">
                                                <div
                                                    className={`rsiwi-icon d-grid pointer-event-none ${getFieldNameValue('previewImage') && watcher?.headerType?.[`${type}Url`]
                                                            ? 'click-off pe-none'
                                                            : ''
                                                        }`}
                                                >
                                                    <i
                                                        className={`${import_file_edge_large} icon-lg color-primary-blue `}
                                                    ></i>

                                                    <label className="rsiwi-label">Upload {type}</label>
                                                </div>
                                                <span className="opacity-0  position-absolute">
                                                    {showUpload && (
                                                        <RSFileUpload
                                                            control={control}
                                                            name={getUniqueName(uploadConfig.fieldName)}
                                                            placeholder={watchUploadUrl?.fileName || uploadConfig.placeholder}
                                                            accept={uploadConfig.accept}
                                                            clearErrors={clearErrors}
                                                            setError={setError}
                                                            required={
                                                                type === 'image'
                                                                    ? isEditable && watchUploadUrl[fileType] === 'Upload'
                                                                    : isEditable
                                                            }
                                                            {...(isEditable && watchUploadUrl[fileType] === 'Upload'
                                                                ? { rules: { required: uploadConfig.errorKey } }
                                                                : {})}
                                                            isbase64
                                                            watch={watch}
                                                            size={handleSize(watcher?.headerType?.mediaSize)}
                                                            base64Data={async (base64, fileName, contentLength) => {
                                                                await handleUploadApi({
                                                                    base64,
                                                                    fileName,
                                                                    contentLength,
                                                                });
                                                            }}
                                                            isBase64Status
                                                            {...(uploadConfig.id && { id: uploadConfig.id })}
                                                            {...(uploadConfig.text && { text: uploadConfig.text })}
                                                            {...(uploadConfig.isPrefix && { isPrefix: uploadConfig.isPrefix })}
                                                            {...(uploadConfig.fileType && { fileType: uploadConfig.fileType })}
                                                            {...(uploadConfig.id && {
                                                                handleChange: () => {
                                                                    setValue(getUniqueName('errorImport'), '');
                                                                },
                                                            })}
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                            {(() => {
                                                const uploadUrlValue = watcher?.headerType?.[`${type}UploadUrl`];
                                                const uploadUrlDisplay =
                                                    typeof uploadUrlValue === 'string'
                                                        ? uploadUrlValue
                                                        : uploadUrlValue?.url ?? '';
                                                return uploadUrlDisplay ? (
                                                    <span className='position-relative top15'>
                                                        <RSTooltip text={uploadUrlDisplay}>
                                                            {truncateTitle(uploadUrlDisplay, 20)}
                                                        </RSTooltip>
                                                    </span>
                                                ) : null;
                                            })()}
                                            {uploadLoader.isLoading && (
                                                <span
                                                    className="d-inline-flex align-items-center justify-content-center position-absolute"
                                                    style={{ right: 15, top: 35 }}
                                                >
                                                    <span className="segment_loader"></span>
                                                </span>
                                            )}
                                        </div>                                    </Col>
                                    <Col className="pr0 rsiuw-4 digipopup-import ">
                                        {(errorImport || !!errorMessage?.length) && (
                                            <div
                                                className={`pb10 color-primary-red lh-sm fs13 pt15 ${Importwatch && errorMessage?.length ? 'custom-error' : ''
                                                    }`}
                                            >
                                                {errorMessage?.length ? errorMessage : errorImport}
                                            </div>
                                        )}

                                    </Col>
                                </Row>
                            </div>
                            {type && (
                                <div className="d-flex justify-content-between">
                                    <small>
                                        Accept format{' '}
                                        {type === 'image'
                                            ? '.jpg, .jpeg and .png'
                                            : type === 'video'
                                                ? '.mp4'
                                                : type === 'audio'
                                                    ? '.mp3'
                                                    : type === 'pdf' || type === 'docs'
                                                        ? '.pdf'
                                                        : ''}{' '}
                                    </small>
                                    {Math.round(handleSize(watcher?.headerType?.mediaSize) / 1000000) > 0 && (
                                        <small className="small-text-space-top">
                                            {`Max. size: ${numberWithCommas(
                                                Math.round(handleSize(watcher?.headerType?.mediaSize) / 1000000)
                                            )} MB`}
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </>
        </div>
    );
};

export default Import;
