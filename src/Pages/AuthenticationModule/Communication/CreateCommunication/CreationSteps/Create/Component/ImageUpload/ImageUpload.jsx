import { formatMaxFileSizeDisplay } from 'Utils/modules/formatters';
import { WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_PROPER_URL, ENTER_VALID_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES, WEBSITE_RULES } from 'Constants/GlobalConstant/Rules';

import { ALLOWED_FORMATS, CANCEL, DOCUMENT_URL, FILE_NAME_EXTENSIONS_JPG_PNG, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_VIDEO, FILE_NAME_EXTENSIONS_PDF, Image_URL, IMAGE_URL, LARGE_VIDEO_UPLOAD_GUIDANCE, MEDIA_URL, Pdf_URL, UPLOAD, UPLOAD_IMAGE, UPLOAD_MEDIA, VIDEO_UPLOAD, Video_URL, VIDEO_URL } from 'Constants/GlobalConstant/Placeholders';
import { builder_upload_large, circle_question_mark_medium, editor_image_medium, editor_pdf_medium, editor_video_medium, mobile_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';


import RSModal from 'Components/RSModal';
import RSTooltip from 'Components/RSTooltip';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSInput from 'Components/FormFields/RSInput';
import { getSessionId } from 'Reducers/globalState/selector';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import { getFileUploadSize } from 'Reducers/communication/createCommunication/Create/request';
import useQueryParams from 'Hooks/useQueryParams';
import { smsList } from 'Reducers/communication/createCommunication/Create/selectors';

import ResDDCustomUpload from 'Pages/KendoDocs/CommonComponents/ResDDCustomUpload';


import { getCommunicationImageUploadAcceptAttribute, getCommunicationImageUploadAcceptMimeTypes, getCommunicationImageUploadFormatsHintText, getCommunicationImageUploadInvalidTypeMessage, parseAcceptAttributeToDotExtensions, getImageSpecs, SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES, getSocialImageAcceptAttribute, getSocialImageAcceptMimeTypes, getSocialInvalidFileTypeError, getSocialMaxSizeError, getSocialSupportedFormatsText, getSocialVideoAcceptExtensions, getSocialVideoAcceptMimeTypes, getVideoSpecs, getDocumentSpecs } from '../../Tabs/SocialPost/socialMediaConfig';
import { object } from 'prop-types';

const isSocialStoryVideoFile = (file) =>
    Boolean(
        file &&
            ((file.type && String(file.type).startsWith('video/')) ||
                /\.(mp4|mov|m4v|webm)$/i.test(String(file.name || ''))),
    );

const getEffectiveClientMaxBytes = (candidateBytes, channelType, contentType) => {
    const base = typeof candidateBytes === 'number' && candidateBytes > 0 ? candidateBytes : null;
    if (
        channelType === 'socialMedia' &&
        ['img', 'video', 'story', 'img/video', 'pdf'].includes(contentType)
    ) {
        return base
            ? Math.min(base, SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES)
            : SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES;
    }
    return base;
};

const fileNameFromMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    try {
        const path = String(url).split('?')[0];
        const seg = path.split('/').pop();
        return seg && seg.length < 200 ? seg : '';
    } catch {
        return '';
    }
};

const ImageUpload = ({
    isSplit,
    fieldName,
    contentType = 'img',
    handleImageData = () => { },
    /** Instagram Story: called when user picks a video file (`contentType="story"`). */
    handleVideoData = null,
    channelType,
    isPrefix,
    setImagePreviewStatus = () => { },
    isbase64,
    isNotificationUpload = false,
    isAlertPush,
    iconTitleText = false,
    setShowTooltip = () => { },
    setIsUploading = () => { },
    isWhatsApp = false,
    isCustomFormat = false,
    isRCS = false,
    size = null,
    /** Same as `size` (max bytes); when both are set, `maxSize` wins. */
    maxSize = null,
    platformType = null,
    /** Social post card selection; when set with `channelType === 'socialMedia'`, drives accept lists and MIME checks. */
    socialPostType = null,
    hideDefaultTrigger = false,
    openImageUploadModal = false,
    onImageUploadModalRequestClose = () => {},
    deferImageApplyUntilUpload = false,
    onApplyImageUrlFromModal = null,
    /** Called after user chooses Remove image / Remove video / Remove pdf from the toolbar menu. */
    onClearedMedia = null,
    acceptFormat= {},
    isDynamicZone = false
}) => {
    // Use social-media config as the single source whenever social channel is active.
    // postType can be null; socialMediaConfig falls back to platform-level defaults.
    const useSocialPostSpec = channelType === 'socialMedia' && !!platformType;
    const isSocialPostMediaFlow = channelType === 'socialMedia';

    const effectiveMaxBytes = useMemo(() => {
        const fromProps = maxSize ?? size;
        if (fromProps != null && Number(fromProps) > 0) {
            return Number(fromProps);
        }
        if (!useSocialPostSpec) {
            return null;
        }
        try {
            if (contentType === 'video') {
                return getVideoSpecs(platformType, socialPostType).maxFileSize;
            }
            if (contentType === 'pdf') {
                return getDocumentSpecs(platformType, socialPostType).maxFileSize;
            }
            if (contentType === 'story') {
                const imgMax = getImageSpecs(platformType, socialPostType).maxFileSize;
                const vidMax = getVideoSpecs(platformType, socialPostType).maxFileSize;
                return Math.max(Number(imgMax) || 0, Number(vidMax) || 0) || null;
            }
            return getImageSpecs(platformType, socialPostType).maxFileSize;
        } catch {
            return null;
        }
    }, [maxSize, size, useSocialPostSpec, platformType, socialPostType, contentType]);

    /** Modal copy: all social post uploads show the RESUL 30 MB cap (not per-network doc limits). */
    const uploadModalMaxBytes = useMemo(() => {
        if (channelType === 'socialMedia') {
            return SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES;
        }
        return effectiveMaxBytes;
    }, [channelType, effectiveMaxBytes]);

    /** Base args for accept/MIME/format hints ({@link socialMediaConfig} unified helpers). */
    const getUploadAcceptParams = useCallback(
        (overrideContentType = null) => ({
            channelType,
            platformType,
            socialPostType,
            contentType: overrideContentType ?? contentType,
            isCustomFormat,
        }),
        [channelType, platformType, socialPostType, contentType, isCustomFormat],
    );

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const { control, clearErrors, setError, resetField, watch, getFieldState, getValues, trigger, setValue , formState } =
    useFormContext();
    const [disableOptions, setDisableOptions] = useState([]);
    const { campaignDetails } = useSelector((state) => smsList(state));
    const [disableUpload, setDisableUpload] = useState(false);
    const [isUpload, setUpload] = useState({
        show: false,
        type: null,
    });
    const [err, setErrorMessage] = useState('');
    const [details, setDetails] = useState({
        options: [],
        icons: '',
    });
    const [urlType, setUrlType] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploaded, setIsUploaded] = useState(false);
    const [isPasted, setIsPasted] = useState(false);
    const [isFileInvalid, setIsFileInvalid] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    /** When reopening the modal, show the current server/URL asset name without a File object. */
    const [rebindLabel, setRebindLabel] = useState(null);
    const prevUploadModalOpenRef = useRef(false);
    const { show, type } = isUpload;
    const previewImageName = isSplit ? `${fieldName}.previewImage` : 'previewImage';
    const previewVideoName = isSplit ? `${fieldName}.previewImage_video` : 'previewImage_video';
    const browserImageName = isSplit ? `${fieldName}.browserImage` : 'browserImage';
    const uploadImageName = isSplit ? `${fieldName}.uploadImageName` : 'uploadImageName';
    const inputUrlName = isSplit ? `${fieldName}.inputUrl` : 'inputUrl'; // Separate field for input value
    const mediaURL = isSplit ? `${fieldName}.waMediaURL` : 'waMediaURL';
    const mediaType = isSplit ? `${fieldName}.waMediaURLType` : 'waMediaURLType';
    const serverImageURLName = isSplit ? `${fieldName}.serverImageURL` : 'serverImageURL'; // Server image URL from API
    const serverVideoURLName = isSplit ? `${fieldName}.serverVideoURL` : 'serverVideoURL'; // Server video URL from API
    const [previewImage, browserImage, previewVideo, uploadImage, inputUrl] = watch([
        previewImageName,
        browserImageName,
        previewVideoName,
        uploadImageName,
        inputUrlName,
    ]);
    const showLargeVideoUploadGuidance =
        channelType === 'socialMedia' && ['video', 'story', 'img/video'].includes(contentType);
    const [hide_getFileAPI, setHideGetFileAPI] = useState(false);
    useEffect(() => {
        if (previewImage || browserImage || previewVideo || uploadImage) {
            if (contentType === 'video') {
                setDisableOptions(isSocialPostMediaFlow ? [UPLOAD_MEDIA] : ['Video upload']);
            } else if (contentType === 'story') {
                setDisableOptions(
                    isSocialPostMediaFlow
                        ? [MEDIA_URL, UPLOAD_MEDIA, 'Browse image']
                        : ['Image URL', 'Image upload', 'Browse image'],
                );
            } else if (contentType === 'pdf') {
                setDisableOptions(['Document upload']);
            } else {
                setDisableOptions(
                    isSocialPostMediaFlow
                        ? [MEDIA_URL, UPLOAD_MEDIA, 'Browse image']
                        : ['Image URL', 'Image upload', 'Browse image'],
                );
            }
        } else {
            setDisableOptions([
                contentType === 'video'
                    ? 'Remove video'
                    : contentType === 'story'
                      ? 'Remove media'
                      : contentType === 'pdf'
                        ? 'Remove pdf'
                        : 'Remove image',
            ]);
        }
    }, [previewImage, browserImage, previewVideo, uploadImage, contentType, isSocialPostMediaFlow]);

    /** Rebind existing media when the combined upload modal opens (image / video / PDF). */
    useEffect(() => {
        const justOpened = show && !prevUploadModalOpenRef.current;
        prevUploadModalOpenRef.current = show;
        if (!show) {
            return;
        }
        if (!justOpened || type !== 'imageUpload') {
            return;
        }

        let mediaUrl = '';
        if (contentType === 'video' || contentType === 'story') {
            mediaUrl =
                String(getValues(browserImageName) || getValues(previewVideoName) || getValues(previewImageName) || '').trim();
        } else {
            mediaUrl = String(getValues(browserImageName) || getValues(previewImageName) || '').trim();
        }

        if (!mediaUrl) {
            setRebindLabel(null);
            setIsUploaded(false);
            return;
        }

        const pName = String(getValues('previewName') || '').trim();
        const label =
            pName ||
            fileNameFromMediaUrl(mediaUrl) ||
            (contentType === 'video'
                ? 'Current video'
                : contentType === 'story'
                  ? 'Current story media'
                  : contentType === 'pdf'
                    ? 'Current document'
                    : 'Current image');

        setRebindLabel(label);
        setIsUploaded(true);
        setSelectedFile(null);
        setIsFileInvalid(false);

        const inputVal = String(getValues(inputUrlName) || '').trim();

    }, [show, type, contentType, getValues, setValue, inputUrlName, browserImageName, previewImageName, previewVideoName]);

    useEffect(() => {
        if (!hideDefaultTrigger || !openImageUploadModal) return;
        clearErrors();
        setErrorMessage('');
        setDisableUpload(false);
        setUpload({
            show: true,
            type: 'imageUpload',
        });
    }, [hideDefaultTrigger, openImageUploadModal]);

    // console.log(previewImage, 'previewImage data');
    // console.log(browserImage, 'browserImage');
    // console.log(uploadImage, 'uploadImage');

    useEffect(() => {
        let contentValueData = [],
            iconImage = editor_image_medium;
        if (contentType === 'img') {
            contentValueData = isSocialPostMediaFlow
                ? [UPLOAD_MEDIA, 'Remove image']
                : ['Image upload', 'Remove image'];
            iconImage = editor_image_medium;
        } else if (contentType === 'video') {
            contentValueData = isSocialPostMediaFlow
                ? [UPLOAD_MEDIA, 'Remove video']
                : ['Video upload', 'Remove video'];
            iconImage = editor_video_medium;
        } else if (contentType === 'story') {
            contentValueData = isSocialPostMediaFlow
                ? [UPLOAD_MEDIA, 'Remove media']
                : ['Image upload', 'Remove media'];
            iconImage = mobile_medium;
        } else if (contentType === 'pdf') {
            contentValueData = isSocialPostMediaFlow
                ? [UPLOAD_MEDIA, 'Remove pdf']
                : ['Document upload', 'Remove pdf'];
            iconImage = editor_pdf_medium;
        }
        setDetails({
            options: contentValueData,
            icons: iconImage,
        });
        if (!isSocialPostMediaFlow) {
            setValue('browserImage', '');
        }
    }, [contentType, isSocialPostMediaFlow, setValue]);

    const handleClose = (shouldClear = false) => {
        if (shouldClear) {
            setValue(uploadImageName, '');
            setValue(previewImageName, '');
            setValue(previewVideoName, '');
            setValue(browserImageName, '');
            setValue(serverImageURLName, '');
            setValue(serverVideoURLName, '');
        }
        setValue(inputUrlName, '');
        setUpload({
            show: false,
            type: null,
        });
        setErrorMessage('');
        clearErrors();
        setDisableUpload(false);
        setShowTooltip(false);
        setSelectedFile(null);
        setIsUploaded(false);
        setIsFileInvalid(false);
        setIsPasted(false);
        setRebindLabel(null);
        if (hideDefaultTrigger) {
            onImageUploadModalRequestClose();
        }
    };
    const handleSave = () => {
        setUpload({
            show: false,
            type: null,
        });
        setImagePreviewStatus(true);
        setShowTooltip(false);
        if (hideDefaultTrigger) {
            onImageUploadModalRequestClose();
        }
    };

    const getValidation = (e, uploadFieldName) => {
        // debugger;
        var allowedExtensions_img = /^https?:\/\/.*\.(png|gif|webp|jpeg|jpg)(\?.*)?$/i;
        var allowedExtensions_video = /\.(mp4|mov|m4v)(\?|#|$)/i;
        var allowedExtensions_pdf = /\.(pdf)$/i;
        var allowedExtensions_all = /^https?:\/\/.*\.(png|gif|mp3|pdf|mp4|mov|m4v|jpeg|jpg)(\?.*)?$/i;
        var test_url_img = allowedExtensions_img.test(e);
        var test_url_video = allowedExtensions_video.test(e);
        var test_url_pdf = allowedExtensions_pdf.test(e);
        var test_url_all = allowedExtensions_all.test(e);

        if (contentType === 'img' && !isNotificationUpload) {
            if (useSocialPostSpec) {
                const urlWithoutQuery = String(e || '')
                    .split('?')[0]
                    .split('#')[0]
                    .toLowerCase();
                const ext = urlWithoutQuery.includes('.') ? `.${urlWithoutQuery.split('.').pop()}` : '';
                const allowedImageExts = getSocialImageAcceptAttribute(platformType, socialPostType)
                    .split(',')
                    .map((s) => s.trim().toLowerCase())
                    .filter(Boolean);

                if (ext && !allowedImageExts.includes(ext)) {
                    setErrorMessage(`Supported formats: ${allowedImageExts.join(', ')}`);
                    return false;
                }
            }
            var videoUrlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv)/i;
            if (videoUrlPattern.test(e)) {
                setErrorMessage('Please enter an image URL, not a video URL');
                return false;
            }
            var pdfUrlPattern = /\.pdf(\?.*)?$/i;
            if (pdfUrlPattern.test(e)) {
                setErrorMessage('Please enter an image URL, not a PDF URL');
                return false;
            }
            var urlPattern = /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
            if (!urlPattern.test(e)) {
                setErrorMessage('Enter valid URL');
                return false;
            }
            return true;
        }
        if (contentType === 'pdf' && !test_url_pdf) {
            setErrorMessage('Enter valid PDF URL ');
            // setError(uploadFieldName, { type: 'custom', message: 'Enter valid PDF URL' });
            return false;
        }
        if (contentType === 'video') {
            const validExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'webm', 'mpeg', 'mpg'];
            // if (e.split('.').slice(-1)[0]?.length === 3) {
            if (validExtensions.includes(e.split('.').slice(-1)[0])) return true;
            else {
                setErrorMessage('Enter valid video URL ');
                // setError(uploadFieldName, { type: 'custom', message: 'Enter valid URL' });
                return false;
            }
            // } else {
            //     return true;
            // }
        }
        if (contentType === 'story' || contentType === 'img/video') {
            if (test_url_img || test_url_video) {
                setErrorMessage('');
                return true;
            }
            setErrorMessage('Enter valid image or video URL');
            return false;
        }
        if (contentType === 'img' && isNotificationUpload) {
            let urlTypeValue = e?.split('.')?.pop();
            if (isAlertPush && ['mp4', 'mov', 'mp3'].includes(urlTypeValue)) {
                // setError(previewImageName, { type: 'custom', message: 'Enter a image for alert' });
                setErrorMessage('Enter a image for alert');
                return false;
            } else if (!test_url_all) {
                return false;
            }
        }
        setErrorMessage('');
        return true;
    };
    function isYoutubeOrVimeoUrl(url) {
        if (!url) return false;
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\//i;
        return youtubeRegex.test(url) || vimeoRegex.test(url);
    }
    const fetchUploadSize = async (e, uploadFieldName, customSize = null, setPreview = false) => {
        const effectiveCustomSize = customSize;
        if (isNotificationUpload) {
            let urlTypeValue = e?.split('.')?.pop();
            // if(isAlertPushb && ['mp4','mp3'].includes(urlTypeValue) ){
            //     setError(uploadFieldName, { type: 'custom', message: 'Enter valid URL' });
            //     setDisableUpload(false);
            // }
            setUrlType(urlTypeValue);
        }
        if (contentType === 'video' && isWhatsApp && isYoutubeOrVimeoUrl(e)) {
            setDisableUpload(true);
            // Only set preview values if setPreview is true
            if (setPreview) {
                setValue(uploadFieldName, e);
                setValue(previewVideoName, e);
                setValue(previewImageName, e);
                setValue(uploadImageName, '');
            }
            setErrorMessage('');
            return;
        }
        if (!getValidation(e, uploadFieldName)) {
            const errorMessage = contentType === 'img' ? 'Enter valid image URL' :
                contentType === 'video' ? 'Enter valid video URL' :
                    contentType === 'pdf' ? 'Enter valid document URL' :
                        contentType === 'story' ? 'Enter valid image or video URL' : 'Enter valid URL';
            setError(uploadFieldName, { type: 'custom', message: errorMessage });
            trigger(uploadFieldName);
            setDisableUpload(false);
            // Only clear the field if we're setting preview, otherwise keep the value for user to see
            if (setPreview) {
                setValue(uploadFieldName, '');
            }
        } else {
            const payload = {
                departmentId,
                userId,
                clientId,
                mediaUrl: e,
                pushType: channelType === 'wpush' || channelType === 'mpush' ? channelType : ''
            };
            const res = await dispatch(
                getFileUploadSize({
                    payload,
                    loading: false,
                }),
            );
            if (res?.status) {
                setHideGetFileAPI(true);
                let urlTypeValue = e?.split('.')?.pop();
                // Store server image URL returned from API
                const serverImageUrl = channelType === 'wpush' || channelType === 'mpush' ? res?.data ?? e : e;

                if (parseFloat(Number(res?.data)) > (effectiveCustomSize ? effectiveCustomSize / 1000000 : 1) && contentType === 'img' && !isNotificationUpload) {
                    setError(uploadFieldName, { type: 'custom', message: `Image size max. ${effectiveCustomSize ? Math.round(effectiveCustomSize / 1000000) + ' MB' : '1 MB'}` });
                    setDisableUpload(false);
                } else if ((contentType === 'img' || contentType === 'img/video') && isNotificationUpload) {
                    if (
                        (urlTypeValue === 'jpg' || urlTypeValue === 'jpeg' || urlTypeValue === 'png' || urlTypeValue === 'gif') &&
                        parseFloat(Number(res?.data)) > (effectiveCustomSize ? effectiveCustomSize / 1000000 : 1)
                    ) {
                        setError(uploadFieldName, { type: 'custom', message: `Image size max. ${effectiveCustomSize ? Math.round(effectiveCustomSize / 1000000) + ' MB' : '1 MB'}` });
                        setDisableUpload(false);
                    } else if ((urlTypeValue === 'mp4' || urlTypeValue === 'mov' || urlTypeValue === 'mp3') && parseFloat(res?.data) > (effectiveCustomSize ? effectiveCustomSize / 1000000 : 15)) {
                        setError(uploadFieldName, { type: 'custom', message: `Video size max. ${effectiveCustomSize ? Math.round(effectiveCustomSize / 1000000) + ' MB' : '15 MB'}` });
                        setDisableUpload(false);
                    } else if (urlTypeValue === 'pdf' && parseFloat(res?.data) > (effectiveCustomSize ? effectiveCustomSize / 1000000 : 5)) {
                        setError(uploadFieldName, { type: 'custom', message: `Document size max. ${effectiveCustomSize ? Math.round(effectiveCustomSize / 1000000) + ' MB' : '5 MB'}` });
                        setDisableUpload(false);
                    } else {
                        setDisableUpload(true);
                        // Only set preview values if setPreview is true
                        if (setPreview) {
                            let urlTypeFormat = e?.split('.')?.pop();
                            switch (urlTypeFormat) {
                                case 'jpg':
                                    setValue(uploadFieldName, e);
                                    setValue(previewImageName, getImageUrlWithExtension(serverImageUrl));
                                    setValue(serverImageURLName, serverImageUrl);
                                    break;
                                case 'jpeg':
                                    setValue(uploadFieldName, e);
                                    setValue(previewImageName, getImageUrlWithExtension(serverImageUrl));
                                    setValue(serverImageURLName, serverImageUrl);
                                    break;
                                case 'png':
                                    setValue(uploadFieldName, e);
                                    setValue(previewImageName, getImageUrlWithExtension(serverImageUrl));
                                    setValue(serverImageURLName, serverImageUrl);
                                    break;
                                case 'gif':
                                    setValue(uploadFieldName, e);
                                    setValue(previewImageName, getImageUrlWithExtension(serverImageUrl));
                                    setValue(serverImageURLName, serverImageUrl);
                                    break;
                                case 'mp4':
                                case 'mov':
                                    setValue(previewVideoName, serverImageUrl);
                                    setValue(serverVideoURLName, serverImageUrl);
                                    break;
                                case 'mp3':
                                    setValue(previewVideoName, serverImageUrl);
                                    setValue(serverVideoURLName, serverImageUrl);
                                    break;
                                case 'pdf':
                                    setValue(`${uploadFieldName}_article`, serverImageUrl);
                                    setValue(serverImageURLName, serverImageUrl);
                                    break;
                                default:
                                    setValue(uploadFieldName, e);
                                    setValue(previewImageName, getImageUrlWithExtension(serverImageUrl));
                                    setValue(serverImageURLName, serverImageUrl);
                            }
                        }
                    }
                } else if (parseFloat(res?.data) > (effectiveCustomSize ? effectiveCustomSize / 1000000 : 5) && contentType === 'pdf') {
                    setError(uploadFieldName, { type: 'custom', message: `Document size max. ${effectiveCustomSize ? (effectiveCustomSize / 1000000) + ' MB' : '5 MB'}` });
                    setDisableUpload(false);
                } else if (parseFloat(res?.data) > (effectiveCustomSize ? effectiveCustomSize / 1000000 : 15) && contentType === 'video') {
                    setError(uploadFieldName, { type: 'custom', message: `Video size max. ${effectiveCustomSize ? Math.round(effectiveCustomSize / 1000000) + ' MB' : '15 MB'}` });
                    setDisableUpload(false);
                } else if (
                    contentType === 'story' &&
                    parseFloat(Number(res?.data)) > (effectiveCustomSize ? effectiveCustomSize / 1000000 : 4 * 1024)
                ) {
                    setError(uploadFieldName, {
                        type: 'custom',
                        message: `Media size max. ${effectiveCustomSize ? Math.round(effectiveCustomSize / 1000000) + ' MB' : '4096 MB'}`,
                    });
                    setDisableUpload(false);
                } else {
                    setDisableUpload(true);
                    // Only set preview values if setPreview is true
                    if (setPreview) {
                        if (contentType === 'pdf') {
                            setValue(uploadFieldName, e);
                            setValue(previewImageName, serverImageUrl); // Set previewImage for PDF URLs
                            setValue(serverImageURLName, serverImageUrl);
                        } else {
                            setValue(uploadFieldName, e);
                            setValue(previewImageName, getImageUrlWithExtension(serverImageUrl)); // Set preview for image URLs
                            setValue(serverImageURLName, serverImageUrl);
                        }
                        setValue(uploadImageName, '');
                    }
                }
                if (
                    isNotificationUpload &&
                    (channelType === 'wpush' || channelType === 'mpush') &&
                    typeof serverImageUrl === 'string' &&
                    /^https?:\/\//i.test(serverImageUrl.trim())
                ) {
                    const hosted = serverImageUrl.trim();
                    if (/\.(mp4|mov|m4v|webm|mp3)(\?|#|$)/i.test(hosted)) {
                        setValue(serverVideoURLName, hosted);
                        setValue(serverImageURLName, '');
                    } else {
                        setValue(serverImageURLName, hosted);
                        setValue(serverVideoURLName, '');
                    }
                }
            } else {
                setHideGetFileAPI(false);
                const errorMessage =
                    contentType === 'img' || contentType === 'img/video'
                        ? 'Enter valid image URL'
                        : contentType === 'video'
                          ? 'Enter valid video URL'
                          : contentType === 'pdf'
                            ? 'Enter valid document URL'
                            : contentType === 'story'
                              ? 'Enter valid image or video URL'
                              : 'Enter valid URL';
                setError(uploadFieldName, { type: 'custom', message: errorMessage });
                setDisableUpload(false);
            }
        }
    };

    const applyImportUrlWithUploadSize = async (userUrl) => {
        if (typeof onApplyImageUrlFromModal !== 'function') {
            return { status: false, message: 'Cannot apply URL' };
        }
        const trimmed = String(userUrl || '').trim();
        await fetchUploadSize(trimmed, inputUrlName, uploadModalMaxBytes, false);
        const urlFieldState = getFieldState(inputUrlName);
        if (urlFieldState.invalid) {
            return {
                status: false,
                message: urlFieldState.message || 'Invalid URL',
            };
        }
        const serverUrl = String(
            getValues(serverVideoURLName) || getValues(serverImageURLName) || '',
        ).trim();
        return onApplyImageUrlFromModal(trimmed, { serverUrl });
    };

    const getImageUrlWithExtension = (imageUrl) => {
        if (!imageUrl) return imageUrl;

        const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'webm', 'mpeg', 'mpg'];
        const urlExtension = imageUrl.split('.').pop().toLowerCase();

        if (videoExtensions.includes(urlExtension)) {
            return imageUrl;
        }

        const hasExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico)(\?.*)?$/i.test(imageUrl);
        if (hasExtension) return imageUrl;

        if (imageUrl.startsWith('http')) {
            return `${imageUrl}#.jpg`;
        }

        return imageUrl;
    };

    const getContentType = () => {
        if (contentType === 'img' && isNotificationUpload && isAlertPush) {
            return `${ALLOWED_FORMATS} ${FILE_NAME_EXTENSIONS_JPG_PNG_JPEG}`;
        } else if (contentType === 'img' && isNotificationUpload) {
            return `${ALLOWED_FORMATS} ${FILE_NAME_EXTENSIONS_JPG_PNG_JPEG}`;
        }  else if (contentType === 'img/video' && isNotificationUpload) {
            return `${ALLOWED_FORMATS} ${FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_VIDEO}`;
        }
        else if (contentType === 'img' && useSocialPostSpec) {
            return `${ALLOWED_FORMATS} ${getSocialSupportedFormatsText('img', platformType, socialPostType)}`;
        } else if (contentType === 'img' && isWhatsApp) {
            return `${ALLOWED_FORMATS} ${FILE_NAME_EXTENSIONS_JPG_PNG}`;
        } else if (contentType === 'img') {
            return acceptFormat?.acceptFormatLabel
                ? `${ALLOWED_FORMATS} ${acceptFormat.acceptFormatLabel}`
                : `${ALLOWED_FORMATS} ${getCommunicationImageUploadFormatsHintText(getUploadAcceptParams('img'))}`;
        } else if (contentType === 'pdf') {
            return `${ALLOWED_FORMATS} ${FILE_NAME_EXTENSIONS_PDF}`;
        } else if (contentType === 'video' && useSocialPostSpec) {
            return `${ALLOWED_FORMATS} ${getSocialSupportedFormatsText('video', platformType, socialPostType)}`;
        } else if (contentType === 'video') {
            return `${ALLOWED_FORMATS} ${getCommunicationImageUploadFormatsHintText(getUploadAcceptParams('video'))} ${isWhatsApp ? ' or youTube/vimeo link' : ''}`;
        } else if (contentType === 'story' && useSocialPostSpec) {
            return `${ALLOWED_FORMATS} ${getSocialSupportedFormatsText('story', platformType, socialPostType)}`;
        } else return `${ALLOWED_FORMATS} ${getCommunicationImageUploadFormatsHintText(getUploadAcceptParams('story'))}`;
    };

    const getSupportedFormatsHelperText = () => {
        if (channelType === 'socialMedia') {
            const socialContentType = contentType === 'img/video' ? 'story' : contentType;
            return `${ALLOWED_FORMATS} ${getSocialSupportedFormatsText(
                socialContentType,
                platformType,
                socialPostType,
            )}`;
        }
        if (contentType === 'video' || contentType === 'pdf' || contentType === 'story') {
            return getContentType();
        }
        if (acceptFormat?.acceptFormatLabel) {
            return `${ALLOWED_FORMATS} ${acceptFormat.acceptFormatLabel}`;
        }
        const hintCt = contentType === 'img/video' ? 'img/video' : 'img';
        return `${ALLOWED_FORMATS} ${getCommunicationImageUploadFormatsHintText(getUploadAcceptParams(hintCt))}`;
    };

    /** RSModal header: upload vs URL/browse modes by modal `type` and `contentType`. */
    const getUploadModalHeader = () => {
        if (isSocialPostMediaFlow) {
            if (type === 'imageUpload' || type === 'browse') {
                return UPLOAD_MEDIA;
            }
            return MEDIA_URL;
        }
        if (type === 'imageUpload') {
            if (contentType === 'video') return VIDEO_UPLOAD;
            if (contentType === 'story') return 'Upload media';
            if (contentType === 'pdf') return 'Upload pdf';
            if (contentType === 'img/video') {
                return isNotificationUpload ? UPLOAD_MEDIA : UPLOAD_IMAGE;
            }
            return isNotificationUpload && isDynamicZone ? UPLOAD_MEDIA : UPLOAD_IMAGE;
        }
        if (type === 'browse') {
            return UPLOAD_IMAGE;
        }
        if (contentType === 'video') return VIDEO_URL;
        if (contentType === 'story') return 'Image or video URL';
        if (contentType === 'pdf') {
            return type === 'browse pdf' ? 'Upload pdf' : DOCUMENT_URL;
        }
        return IMAGE_URL;
    };

    const getInputUrlPlaceholder = ({ includeMixedMedia = false, includeDynamicMediaFallback = true } = {}) => {
        if (isSocialPostMediaFlow) {
            return MEDIA_URL;
        }
        if (contentType === 'video') return Video_URL;
        if (contentType === 'story' || (includeMixedMedia && contentType === 'img/video')) {
            return 'Image or video URL';
        }
        if (contentType === 'pdf') return Pdf_URL;
        if (includeDynamicMediaFallback && isNotificationUpload && isDynamicZone) {
            return MEDIA_URL;
        }
        if (includeDynamicMediaFallback && isNotificationUpload) {
            if (contentType === 'img/video') {
                return MEDIA_URL;
            }
        }
        return Image_URL;
    };

    const getAcceptAttribute = ({ includeAcceptOverride = true } = {}) => {
        if (includeAcceptOverride && acceptFormat?.accept) {
            return acceptFormat.accept;
        }
        return getCommunicationImageUploadAcceptAttribute({
            channelType,
            platformType,
            socialPostType,
            contentType,
            isCustomFormat,
        });
    };

    const requiredMessage = (() => {
        if (isSocialPostMediaFlow) {
            return 'Enter media URL';
        }
        if (type === 'browse') {
            return 'Enter image URL';
        }
        if (contentType === 'video') {
            return 'Enter video URL';
        }
        if (contentType === 'story') {
            return 'Enter image or video URL';
        }
        if (contentType === 'pdf') {
            return 'Enter document URL';
        }
        return 'Enter image URL';
    })();

    const validateImageUrl = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };
    const validateVideoUrl = async (url) => {
        const raw = String(url || '').trim();
        if (!raw) return false;
        try {
            if (isWhatsApp && isYoutubeOrVimeoUrl(raw)) {
                return true;
            }
            const validExtensions = ['mp4', 'mov', 'm4v', 'webm'];
            const pathNoQuery = raw.split('?')[0].split('#')[0];
            const urlExtension = pathNoQuery.split('.').pop()?.toLowerCase() || '';

            /** CDNs often block or fail cross-origin HEAD; accept HTTPS URLs with a known video extension. */
            const trustExtensionForHttps =
                /^https?:\/\//i.test(raw) && validExtensions.includes(urlExtension);

            if (validExtensions.includes(urlExtension)) {
                try {
                    const response = await fetch(raw, { method: 'HEAD' });
                    if (response.ok) {
                        return true;
                    }
                    if (trustExtensionForHttps) {
                        return true;
                    }
                } catch {
                    if (trustExtensionForHttps) {
                        return true;
                    }
                    return false;
                }
                if (trustExtensionForHttps) {
                    return true;
                }
            }
            const response = await fetch(raw, { method: 'HEAD' });
            if (response.ok) {
                const cType = response.headers.get('Content-Type');
                if (cType && cType.startsWith('video/')) {
                    return true;
                }
            }

            return false;
        } catch {
            return false;
        }
    };
    useEffect(() => {
        if (show) {
            setShowTooltip(false);
        }
    }, [show, setShowTooltip]);

    const clearModalSelectedFile = () => {
        setSelectedFile(null);
        setRebindLabel(null);
        setIsUploaded(false);
        setIsFileInvalid(false);
        setValue(uploadImageName, '');
        setValue(previewImageName, '');
        setValue(previewVideoName, '');
        setValue(browserImageName, '');
        setValue(inputUrlName, '');
        setValue('previewName', '');
        clearErrors(uploadImageName);
        const el = document.getElementById('dragDropFileInput');
        if (el) el.value = '';
    };

    const processModalUploadFile = async (file) => {
        if (!file) {
            return;
        }

        const runReader = (uploadHandler = handleImageData) => {
            setRebindLabel(null);
            setSelectedFile(file);
            setIsFileInvalid(false);
            clearErrors(uploadImageName);
            setValue(inputUrlName, '');
            setIsUploaded(false);
            setIsProcessing(true);

          
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const base64String = event.target.result;
                    const base64Only = base64String?.split(';base64,')?.pop();
                    setIsUploading(false);
                    const res = await uploadHandler(base64Only, file.name, file.size, file);
                    if (res?.status) {
                        setIsUploaded(true);
                        setIsFileInvalid(false);
                        setIsUploading(true);
                        setTimeout(() => {
                            setIsUploading(false);
                        }, 300);
                    } else {
                        setIsFileInvalid(true);
                        setValue(uploadImageName, '');
                        setValue(previewImageName, '');
                        setError(uploadImageName, {
                            type: 'custom',
                            message: res?.message,
                        });
                        setIsUploading(false);
                    }
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        };

        if (contentType === 'story' && useSocialPostSpec && handleVideoData) {
            const pickVideo = isSocialStoryVideoFile(file);
            if (pickVideo) {
                const ext = file.name.split('.').pop()?.toLowerCase();
                const allowedExts = getSocialVideoAcceptExtensions(platformType, socialPostType);
                const okExt = allowedExts.includes(ext);
                const allowedMimes = getSocialVideoAcceptMimeTypes(platformType, socialPostType);
                const okMime = allowedMimes.includes(file.type);
                if (!okExt && !okMime) {
                    setSelectedFile(file);
                    setIsFileInvalid(true);
                    setError(uploadImageName, {
                        type: 'custom',
                        message: getSocialInvalidFileTypeError('video', platformType, socialPostType),
                    });
                    return;
                }
                const maxVid = getEffectiveClientMaxBytes(
                    effectiveMaxBytes || getVideoSpecs(platformType, socialPostType).maxFileSize,
                    channelType,
                    contentType,
                );
                if (file.size > maxVid) {
                    setSelectedFile(file);
                    setIsFileInvalid(true);
                    setError(uploadImageName, {
                        type: 'custom',
                        message: getSocialMaxSizeError('video', maxVid),
                    });
                    return;
                }
                runReader(handleVideoData);
                return;
            }
            const acceptedFormatsStory = getSocialImageAcceptMimeTypes(platformType, socialPostType);
            if (!acceptedFormatsStory.includes(file.type)) {
                setSelectedFile(file);
                setIsFileInvalid(true);
                setError(uploadImageName, {
                    type: 'custom',
                    message: getSocialInvalidFileTypeError('story', platformType, socialPostType),
                });
                return;
            }
            const maxImgStory = getEffectiveClientMaxBytes(
                effectiveMaxBytes || getImageSpecs(platformType, socialPostType).maxFileSize,
                channelType,
                contentType,
            );
            if (file.size > maxImgStory) {
                setSelectedFile(file);
                setIsFileInvalid(true);
                setError(uploadImageName, {
                    type: 'custom',
                    message: getSocialMaxSizeError('img', maxImgStory),
                });
                return;
            }
            runReader(handleImageData);
            return;
        }

        if (contentType === 'video') {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const vidDropParams = getUploadAcceptParams('video');
            const allowedDotVideoDrop = parseAcceptAttributeToDotExtensions(
                getCommunicationImageUploadAcceptAttribute(vidDropParams),
            );
            const allowedExtsBareDrop = allowedDotVideoDrop.map((x) => x.replace(/^\./, ''));
            const okExt = allowedExtsBareDrop.includes(ext);
            const allowedMimes = useSocialPostSpec
                ? getSocialVideoAcceptMimeTypes(platformType, socialPostType)
                : getCommunicationImageUploadAcceptMimeTypes(vidDropParams);
            const okMime = allowedMimes.includes(file.type);
            if (!okExt && !okMime) {
                setSelectedFile(file);
                setIsFileInvalid(true);
                setError(uploadImageName, {
                    type: 'custom',
                    message: useSocialPostSpec
                        ? getSocialInvalidFileTypeError('video', platformType, socialPostType)
                        : getCommunicationImageUploadInvalidTypeMessage(vidDropParams),
                });
                return;
            }
            const maxSize = getEffectiveClientMaxBytes(effectiveMaxBytes || 2000000, channelType, contentType);
            if (file.size > maxSize) {
                setSelectedFile(file);
                setIsFileInvalid(true);
                setError(uploadImageName, {
                    type: 'custom',
                    message: useSocialPostSpec
                        ? getSocialMaxSizeError('video', maxSize)
                        : `Video size max. ${Math.round(maxSize / (1024 * 1024))} MB`,
                });
                return;
            }
            runReader();
            return;
        }

        if (contentType === 'pdf') {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const okPdf = file.type === 'application/pdf' || ext === 'pdf';
            if (!okPdf) {
                setSelectedFile(file);
                setIsFileInvalid(true);
                setError(uploadImageName, {
                    type: 'custom',
                    message: useSocialPostSpec
                        ? getSocialInvalidFileTypeError('pdf', platformType, socialPostType)
                        : getCommunicationImageUploadInvalidTypeMessage(getUploadAcceptParams('pdf')),
                });
                return;
            }
            const maxSize = getEffectiveClientMaxBytes(effectiveMaxBytes || 5000000, channelType, contentType);
            if (file.size > maxSize) {
                setSelectedFile(file);
                setIsFileInvalid(true);
                setError(uploadImageName, {
                    type: 'custom',
                    message: `Document size max. ${Math.round(maxSize / (1024 * 1024))} MB`,
                });
                return;
            }
            runReader();
            return;
        }

        const mimeContentTypeImg = contentType === 'img/video' ? 'img/video' : 'img';
        const acceptedFormats = useSocialPostSpec
            ? getSocialImageAcceptMimeTypes(platformType, socialPostType)
            : getCommunicationImageUploadAcceptMimeTypes(getUploadAcceptParams(mimeContentTypeImg));

        if (!acceptedFormats.includes(file.type)) {
            const formatText = useSocialPostSpec
                ? getSocialSupportedFormatsText('img', platformType, socialPostType)
                : getCommunicationImageUploadFormatsHintText(getUploadAcceptParams(mimeContentTypeImg));
            setSelectedFile(file);
            setIsFileInvalid(true);
            setError(uploadImageName, {
                type: 'custom',
                message: `Only ${formatText} files are supported`,
            });
            return;
        }

        const maxSize = getEffectiveClientMaxBytes(effectiveMaxBytes || 1024000, channelType, contentType);
        if (file.size > maxSize) {
            setSelectedFile(file);
            setIsFileInvalid(true);
            setError(uploadImageName, {
                type: 'custom',
                message: useSocialPostSpec
                    ? getSocialMaxSizeError('img', maxSize)
                    : `Image size max. ${Math.round(maxSize / (1024 * 1024))} MB`,
            });
            return;
        }

        runReader();
    };

    return (
        <Fragment>
            {!hideDefaultTrigger && (
            <RSBootstrapdown
                data={details.options}
                defaultItem={
                    <i
                        className={`${details.icons} icon-md`}
                        title={
                            iconTitleText === false
                                ? undefined
                                : iconTitleText ??
                                  (isSocialPostMediaFlow
                                      ? UPLOAD_MEDIA
                                      : contentType === 'video'
                                        ? 'Video upload'
                                        : contentType === 'pdf'
                                          ? 'Document upload'
                                          : 'Image upload')
                        }
                        onMouseLeave={() => {
                            // Always hide tooltip when mouse leaves
                            setShowTooltip(false);
                        }}
                    />
                } className="no_caret"
                showUpdate={false}
                disbleItems={disableOptions}
                onSelect={(text) => {
                    setShowTooltip(false);
                    if (
                        text === 'Image upload' ||
                        text === 'Video upload' ||
                        text === 'Document upload' ||
                        text === UPLOAD_MEDIA
                    ) {
                        clearErrors();
                        setErrorMessage('');
                        setDisableUpload(false);
                        setUpload({
                            show: true,
                            type: 'imageUpload', // Combined modal: drag-drop + URL (image, video, pdf)
                        });
                    }
                    else if (text === 'Browse image') {
                        clearErrors();
                        setErrorMessage('');
                        setDisableUpload(false);
                        setUpload({
                            show: true,
                            type: 'browse',
                        });
                    }
                    else if (text === 'Image URL' || text === 'Document URL' || text === MEDIA_URL) {
                        clearErrors();
                        setErrorMessage('');
                        setDisableUpload(false);
                        setUpload({
                            show: true,
                            type: 'media',
                        });
                    } else {
                        resetField(previewImageName);
                        setValue(previewImageName, '');
                        resetField(browserImageName);
                        resetField(previewVideoName);
                        setValue(previewVideoName, '');
                        setValue(browserImageName, '');
                        setValue(uploadImageName, '');
                        if (isSplit && fieldName) {
                            setValue(`${fieldName}.uploadImage`, '');
                        } else {
                            setValue('uploadImage', '');
                        }
                        setValue(inputUrlName, ''); // Clear the input URL field

                        setValue('previewName', '');
                        setValue(mediaURL, '');
                        setValue(mediaType, '');
                        if (typeof onClearedMedia === 'function') {
                            onClearedMedia();
                        }
                    }
                }}
            />
            )}
            {/* Upload and Browse Modals */}
            <RSModal
                size={'md'}
                show={show}
                header={getUploadModalHeader()}
                handleClose={() => {
                    handleClose(false);
                    setShowTooltip(false);
                }}
                onMouseEnter={() => { if (show) setShowTooltip(false) }}
                onMouseLeave={() => { if (show) setShowTooltip(false) }}
                body={
                    <div className='image-upload-wrapper'>
                        {type === 'imageUpload' ? (
                            <Fragment>
                                <ResDDCustomUpload
                                    inputId="dragDropFileInput"
                                    accept={getAcceptAttribute()}
                                    isMultiFileUpload={false}
                                    isShowUrl
                                    useExternalValidation
                                    control={control}
                                    urlName={inputUrlName}
                                    urlPlaceholder={getInputUrlPlaceholder()}
                                    urlSize={uploadModalMaxBytes || 1024000}
                                    formatsHint={
                                        <small className="d-block">{getSupportedFormatsHelperText()}</small>
                                    }
                                    showMaxSizeHint={!!uploadModalMaxBytes}
                                    maxSizeHintLabel={
                                        uploadModalMaxBytes
                                            ? formatMaxFileSizeDisplay(uploadModalMaxBytes)
                                            : undefined
                                    }
                                    dropZoneExtra={
                                        showLargeVideoUploadGuidance ? (
                                            <small className="d-block mt5">
                                                {LARGE_VIDEO_UPLOAD_GUIDANCE}
                                            </small>
                                        ) : null
                                    }
                                    urlHint={
                                        <small className="supported-formats-text mt5 lh-sm">
                                            {getContentType()}
                                        </small>
                                    }
                                    selectedFile={
                                        selectedFile || (rebindLabel ? { name: rebindLabel } : null)
                                    }
                                    disabled={!!inputUrl || !!selectedFile || !!rebindLabel}
                                    isProcessing={isProcessing}
                                    isFileInvalid={isFileInvalid}
                                    errorMessage={getFieldState(uploadImageName)?.message}
                                    iconClassName={`${builder_upload_large} icon-xl color-primary-blue`}
                                    onFileSelect={(file) => processModalUploadFile(file)}
                                    onClear={clearModalSelectedFile}
                                    onUrlChange={(e) => {
                                        if (e.target.value) {
                                            setValue(browserImageName, '');
                                            setValue(uploadImageName, '');
                                            setValue(previewImageName, '');
                                            clearErrors(inputUrlName);
                                            setIsUploaded(false);
                                            setSelectedFile(null);
                                            setRebindLabel(null);
                                            setIsFileInvalid(false);
                                        } else if (deferImageApplyUntilUpload) {
                                            setDisableUpload(false);
                                        }
                                    }}
                                    onUrlBlur={async (e) => {
                                        if (
                                            deferImageApplyUntilUpload ||
                                            typeof onApplyImageUrlFromModal === 'function'
                                        ) {
                                            if (!isPasted && !!e.target.value) {
                                                const ok = await trigger(inputUrlName);
                                                if (ok) {
                                                    setDisableUpload(true);
                                                }
                                            }
                                            setIsPasted(false);
                                            return;
                                        }
                                        if (!isPasted && !!e.target.value) {
                                            const isValid = await trigger(inputUrlName);
                                            if (isValid && !hide_getFileAPI) {
                                                await fetchUploadSize(
                                                    e.target.value,
                                                    inputUrlName,
                                                    uploadModalMaxBytes,
                                                    true,
                                                );
                                                setTimeout(() => {
                                                    const previewValue = getValues(previewImageName);
                                                    if (previewValue) {
                                                        setIsUploaded(true);
                                                    }
                                                }, 50);
                                            }
                                        }
                                        if (hide_getFileAPI) {
                                            setTimeout(() => {
                                                const previewValue = getValues(previewImageName);
                                                if (previewValue) {
                                                    setIsUploaded(true);
                                                }
                                            }, 50);
                                        }
                                        setIsPasted(false);
                                    }}
                                    onUrlPaste={async (e) => {
                                        e.preventDefault();
                                        const pastedData = e.clipboardData.getData('text');
                                        if (!!pastedData) {
                                            setIsPasted(true);
                                            setValue(inputUrlName, pastedData);
                                            if (
                                                deferImageApplyUntilUpload ||
                                                typeof onApplyImageUrlFromModal === 'function'
                                            ) {
                                                setTimeout(async () => {
                                                    const ok = await trigger(inputUrlName);
                                                    if (ok) {
                                                        setDisableUpload(true);
                                                    }
                                                    setIsPasted(false);
                                                }, 100);
                                                return;
                                            }
                                            setTimeout(async () => {
                                                const isValid = await trigger(inputUrlName);
                                                if (isValid) {
                                                    await fetchUploadSize(
                                                        pastedData,
                                                        inputUrlName,
                                                        uploadModalMaxBytes,
                                                        true,
                                                    );
                                                    setTimeout(() => {
                                                        const previewValue = getValues(previewImageName);
                                                        if (previewValue) {
                                                            setIsUploaded(true);
                                                        }
                                                    }, 50);
                                                }
                                                setIsPasted(false);
                                            }, 100);
                                        }
                                    }}
                                    urlRules={{
                                        validate: (url) => {
                                            if (!url) return true;
                                            if (contentType === 'img') {
                                                return validateImageUrl(url).then((isValid) => {
                                                    if (isValid) return true;
                                                    if (useSocialPostSpec && getValidation(url, inputUrlName)) {
                                                        return true;
                                                    }
                                                    return 'Enter valid image URL';
                                                });
                                            }
                                            if (contentType === 'video') {
                                                return validateVideoUrl(url).then((isValid) =>
                                                    isValid ? true : `Enter valid ${contentType} URL`,
                                                );
                                            }
                                            if (contentType === 'story' || contentType === 'img/video') {
                                                return validateImageUrl(url).then((okImg) => {
                                                    if (okImg) return true;
                                                    return validateVideoUrl(url).then((okVid) => {
                                                        if (okVid) return true;
                                                        if (useSocialPostSpec && getValidation(url, inputUrlName)) {
                                                            return true;
                                                        }
                                                        return 'Enter valid image or video URL';
                                                    });
                                                });
                                            }
                                            return true;
                                        },
                                    }}
                                />
                                <div className="buttons-holder mt30">
                                    <RSSecondaryButton
                                        className="cancel-btn"
                                        onClick={() => {
                                            // Cancel = leave committed upload unchanged; only clear modal staging.
                                            handleClose(false);
                                            setShowTooltip(false);
                                        }}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        disabledClass={(() => {
                                            const inputUrlState = getFieldState(inputUrlName);
                                            const uploadFieldState = getFieldState(uploadImageName);
                                            const modalFieldBlocked = !!(
                                                inputUrlState.error || uploadFieldState.error
                                            );
                                            const trimmedUrl = String(inputUrl || '').trim();
                                            const canUseUpload =
                                                disableUpload ||
                                                isUploaded ||
                                                !!selectedFile ||
                                                (trimmedUrl.length > 0 && !inputUrlState.invalid);
                                            return ` ${modalFieldBlocked ? 'pe-none click-off' : ''} ${
                                                canUseUpload ? '' : 'pe-none click-off'
                                            }`;
                                        })()}
                                        onClick={async () => {
                                            // If already uploaded (via drop/browse/blur), just close modal
                                            if (isUploaded) {
                                                setValue(inputUrlName, '');
                                                handleClose();
                                                handleSave();
                                                return;
                                            }

                                            // If no file or URL entered, show validation
                                            const value = getValues(inputUrlName);
                                            if (!selectedFile && !value?.length) {
                                                trigger(inputUrlName);
                                                return;
                                            }

                                            // This case shouldn't happen as upload happens automatically now
                                            // But keeping as fallback
                                            if (selectedFile && !isUploaded) {
                                                setIsProcessing(true);
                                                const reader = new FileReader();
                                                reader.onload = async (event) => {
                                                    try {
                                                        const base64String = event.target.result;
                                                        const base64Only = base64String?.split(';base64,')?.pop();
                                                        setIsUploading(false);
                                                        const uploadHandler =
                                                            contentType === 'story' &&
                                                            useSocialPostSpec &&
                                                            handleVideoData &&
                                                            isSocialStoryVideoFile(selectedFile)
                                                                ? handleVideoData
                                                                : handleImageData;
                                                        const res = await uploadHandler(
                                                            base64Only,
                                                            selectedFile.name,
                                                            selectedFile.size,
                                                            selectedFile,
                                                        );
                                                        if (res?.status) {
                                                            setValue(inputUrlName, '');
                                                            setIsUploaded(true);
                                                            handleClose();
                                                            handleSave();
                                                            setIsUploading(true);
                                                            setTimeout(() => {
                                                                setIsUploading(false);
                                                            }, 300);
                                                        } else {
                                                            setValue(uploadImageName, '');
                                                            setValue(previewImageName, '');
                                                            setError(uploadImageName, {
                                                                type: 'custom',
                                                                message: res?.message,
                                                            });
                                                            setIsUploading(false);
                                                        }
                                                    } finally {
                                                        setIsProcessing(false);
                                                    }
                                                };
                                                reader.readAsDataURL(selectedFile);
                                            } else if (value?.length && !isUploaded) {
                                                const isValid = await trigger(inputUrlName);
                                                if (isValid) {
                                                    if (typeof onApplyImageUrlFromModal === 'function') {
                                                        const res = await applyImportUrlWithUploadSize(value);
                                                        if (!res?.status) {
                                                            setError(inputUrlName, {
                                                                type: 'custom',
                                                                message:
                                                                    res?.message ||
                                                                    'Unable to apply URL',
                                                            });
                                                            return;
                                                        }
                                                        setValue(inputUrlName, '');
                                                        handleClose();
                                                        handleSave();
                                                    } else if (!hide_getFileAPI) {
                                                        await fetchUploadSize(
                                                            value,
                                                            inputUrlName,
                                                            uploadModalMaxBytes,
                                                            true,
                                                        );
                                                        setTimeout(() => {
                                                            const previewValue =
                                                                getValues(previewImageName);
                                                            if (previewValue) {
                                                                handleSave();
                                                            }
                                                        }, 50);
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {UPLOAD}
                                    </RSPrimaryButton>
                                </div>
                            </Fragment>
                        ) : type === 'browse' ? (
                            <RSFileUpload
                                channelType={channelType}
                                isPrefix={isPrefix}
                                isbase64={isbase64}
                                control={control}
                                name={'uploadImageName'}
                                text="Browse"
                                isCustomFormat={isCustomFormat}
                                accept={getAcceptAttribute()}
                                customInputClass={'upload-button-top-align ml25'}
                                clearErrors={clearErrors}
                                setError={setError}
                                size={uploadModalMaxBytes || 1024000}
                                platformType={platformType}
                                isBase64Status={true}
                                base64Data={async (base64, fileName, contentLength) => {
                                    setIsUploading(false)
                                    const res = await handleImageData(base64, fileName, contentLength);
                                    if (res?.status) {
                                        //debugger
                                        handleClose();
                                        setIsUploading(true)
                                        setTimeout(() => {
                                            setIsUploading(false)
                                        }, 300);
                                    } else {
                                        setValue(uploadImageName, '');
                                        setValue(previewImageName, '');
                                        setError(uploadImageName, {
                                            type: 'custom',
                                            message: res?.message,
                                        });
                                        setIsUploading(false)
                                    }
                                }}
                                handleChange={(e) => {
                                    //handleClose();
                                    clearErrors('uploadData');
                                }}
                                required
                                watch={watch}
                                customTop
                                customBottomText
                                isRCS={isRCS}
                            />
                        ) : (
                            <Fragment>
                                {type === 'media' && (contentType === 'video' || contentType === 'story') ? (
                                    <RSFileUpload
                                        channelType={channelType}
                                        isPrefix={isPrefix}
                                        isbase64={isbase64}
                                        control={control}
                                        isRaw={true}
                                        name={'uploadVideoName'}
                                        text="Browse"
                                        accept={getAcceptAttribute({ includeAcceptOverride: false })}
                                        clearErrors={clearErrors}
                                        setError={setError}
                                        size={uploadModalMaxBytes || 2000000}
                                        isBase64Status={true}
                                        base64Data={(base64, fileName, contentLength, sourceFile) => {
                                            const raw = base64?.split(';base64,')?.pop();
                                            if (
                                                contentType === 'story' &&
                                                handleVideoData &&
                                                isSocialStoryVideoFile({ name: fileName, type: '' })
                                            ) {
                                                handleVideoData(raw, fileName, contentLength, sourceFile);
                                            } else {
                                                handleImageData(raw, fileName, contentLength);
                                            }
                                        }}
                                        required
                                        handleChange={(e) => {
                                            handleClose();
                                            clearErrors('uploadData');
                                        }}
                                        watch={watch}
                                        fileType={contentType === 'story' ? 'img' : 'video'}
                                    />
                                ) : type === 'browse pdf' ? (
                                    <RSFileUpload
                                        channelType={channelType}
                                        isPrefix={isPrefix}
                                        isbase64={isbase64}
                                        control={control}
                                        isRaw={true}
                                        name={previewImageName}
                                        text="Browse"
                                        accept={'pdf'}
                                        clearErrors={clearErrors}
                                        setError={setError}
                                        size={uploadModalMaxBytes || 2000000}
                                        isBase64Status={true}
                                        base64Data={(base64, fileName, contentLength) => {
                                            handleImageData(
                                                base64?.split(';base64,')?.pop(),
                                                fileName,
                                                contentLength,
                                            );
                                        }}
                                        required
                                        handleChange={(e) => {
                                            handleClose();
                                            clearErrors('uploadData');
                                        }}
                                        watch={watch}
                                        fileType={'pdf'}
                                        customBottomText={true}
                                        isCustomValue=".pdf"
                                    />
                                ) : (
                                    <Row className="mt10">
                                        <Col sm={8}>
                                            {/* {err && !getFieldState(previewImageName)?.invalid && (
                                                    <small className={'color-primary-red'}>{err}</small>
                                                )} */}
                                            <RSInput
                                                control={control}
                                                required
                                                name={inputUrlName}
                                                placeholder={
                                                    !!err
                                                        ? ''
                                                        : getInputUrlPlaceholder({
                                                              includeMixedMedia: true,
                                                              includeDynamicMediaFallback: false,
                                                          })
                                                }
                                                size={uploadModalMaxBytes || 1024000}
                                                // handleOnBlur={(e) => {
                                                //     if (!!e.target.value)
                                                //         fetchUploadSize(e.target.value, previewImageName);
                                                //     if (!previewImageName) setErrorMessage('');
                                                // }}
                                                handleOnBlur={async (e) => {
                                                    if (!isPasted && !!e.target.value) {
                                                        const value = e.target.value;
                                                        const isValid = await trigger(inputUrlName);
                                                        if (isValid) {
                                                            if (
                                                                deferImageApplyUntilUpload ||
                                                                typeof onApplyImageUrlFromModal === 'function'
                                                            ) {
                                                                setDisableUpload(true);
                                                            } else {
                                                                await fetchUploadSize(value, inputUrlName, uploadModalMaxBytes, true);
                                                                setTimeout(() => {
                                                                    const previewValue = getValues(previewImageName);
                                                                    if (previewValue) {
                                                                        setIsUploaded(true);
                                                                    }
                                                                }, 50);
                                                            }
                                                        }
                                                    }
                                                    if (!inputUrlName) setErrorMessage('');
                                                    setIsPasted(false);
                                                }}
                                                handleOnPaste={async (e) => {
                                                    // Prevent the browser from inserting the text itself,
                                                    // otherwise we end up setting the value AND letting the
                                                    // default paste happen, which duplicates the URL.
                                                    e.preventDefault();
                                                    const pastedData = e.clipboardData.getData('text');
                                                    if (!!pastedData) {
                                                        setIsPasted(true);
                                                        setValue(inputUrlName, pastedData);
                                                        setTimeout(async () => {
                                                            const isValid = await trigger(inputUrlName);
                                                            if (isValid) {
                                                                if (
                                                                    deferImageApplyUntilUpload ||
                                                                    typeof onApplyImageUrlFromModal === 'function'
                                                                ) {
                                                                    setDisableUpload(true);
                                                                } else {
                                                                    await fetchUploadSize(pastedData, inputUrlName, uploadModalMaxBytes, true);
                                                                    setTimeout(() => {
                                                                        const previewValue = getValues(previewImageName);
                                                                        if (previewValue) {
                                                                            setIsUploaded(true);
                                                                        }
                                                                    }, 50);
                                                                }
                                                            }
                                                            setIsPasted(false);
                                                        }, 100);
                                                    }
                                                    if (!inputUrlName) setErrorMessage('');
                                                }}
                                                rules={{
                                                    // ...LIST_NAME_RULES(ENTER_PROPER_URL),
                                                    required: requiredMessage,
                                                    // pattern: {
                                                    //     value: WEBSITE_REGEX,
                                                    //     message: ENTER_VALID_URL,
                                                    // },
                                                    validate: (url) => {
                                                        if (!url) return true;
                                                        if (contentType === 'img') {
                                                            return validateImageUrl(url).then((isValid) => {
                                                                if (isValid) return true;
                                                                if (useSocialPostSpec && getValidation(url, inputUrlName)) {
                                                                    return true;
                                                                }
                                                                return `Enter valid image URL`;
                                                            });
                                                        } else if (contentType === 'video') {
                                                            return validateVideoUrl(url).then((isValid) => {
                                                                if (isValid) {
                                                                    return true;
                                                                } else {
                                                                    return `Enter valid ${contentType} URL`;
                                                                }
                                                            });
                                                        } else if (contentType === 'story') {
                                                            return validateImageUrl(url).then((okImg) => {
                                                                if (okImg) return true;
                                                                return validateVideoUrl(url).then((okVid) => {
                                                                    if (okVid) return true;
                                                                    if (useSocialPostSpec && getValidation(url, inputUrlName)) {
                                                                        return true;
                                                                    }
                                                                    return 'Enter valid image or video URL';
                                                                });
                                                            });
                                                        } else {
                                                            return true;
                                                        }
                                                    },
                                                }}
                                            // rules={WEBSITE_RULES}
                                            />
                                            <small>{`${getContentType()}`}</small>
                                            {channelType === 'socialMedia' && (
                                                <small>{`${uploadModalMaxBytes ? `\nMax ${contentType === 'video' ? 'video' : contentType === 'pdf' ? 'document' : contentType === 'story' ? 'media' : 'image'} size: ${formatMaxFileSizeDisplay(uploadModalMaxBytes)}` : ''}`}</small>
                                            )}
                                        </Col>
                                        <Col sm={2} className="pl0">
                                            <div className="upload-button-top-align">
                                                <RSPrimaryButton
                                                    disabledClass={(() => {
                                                        const inputUrlState = getFieldState(inputUrlName);
                                                        const uploadFieldState = getFieldState(uploadImageName);
                                                        const modalFieldBlocked = !!(
                                                            inputUrlState.error || uploadFieldState.error
                                                        );
                                                        const trimmedUrl = String(inputUrl || '').trim();
                                                        const canUseUpload =
                                                            disableUpload ||
                                                            isUploaded ||
                                                            (trimmedUrl.length > 0 && !inputUrlState.invalid);
                                                        return `${modalFieldBlocked ? 'pe-none click-off' : ''} ${
                                                            canUseUpload ? '' : 'pe-none click-off'
                                                        }`;
                                                    })()}
                                                    onClick={async () => {
                                                        if (isUploaded) {
                                                            handleSave();
                                                            return;
                                                        }

                                                        const { invalid } = getFieldState(inputUrlName);
                                                        const value = getValues(inputUrlName);
                                                        if (!invalid && !!value?.length) {
                                                            if (typeof onApplyImageUrlFromModal === 'function') {
                                                                const res = await applyImportUrlWithUploadSize(value);
                                                                if (!res?.status) {
                                                                    setError(inputUrlName, {
                                                                        type: 'custom',
                                                                        message:
                                                                            res?.message ||
                                                                            'Unable to apply URL',
                                                                    });
                                                                    return;
                                                                }
                                                                setValue(inputUrlName, '');
                                                                handleSave();
                                                            } else {
                                                                await fetchUploadSize(value, inputUrlName, uploadModalMaxBytes, true);
                                                                setTimeout(() => {
                                                                    const previewValue = getValues(previewImageName);
                                                                    if (previewValue) {
                                                                        handleSave();
                                                                    }
                                                                }, 50);
                                                            }
                                                        } else {
                                                            trigger(inputUrlName);
                                                        }
                                                        setDisableUpload(false);
                                                    }}
                                                >
                                                    {UPLOAD}
                                                </RSPrimaryButton>
                                            </div>
                                        </Col>
                                        {/* <Col sm={1} className="ml10 pr0">
                                                {contentType !== 'pdf' && (
                                                    <div className="d-flex">
                                                        <RSTooltip text={`${getContentType()}`}>
                                                            <i
                                                                className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                )}
                                            </Col> */}
                                    </Row>
                                )}
                            </Fragment>
                        )}
                    </div>
                }
            />
        </Fragment>
    );
};
export default ImageUpload;