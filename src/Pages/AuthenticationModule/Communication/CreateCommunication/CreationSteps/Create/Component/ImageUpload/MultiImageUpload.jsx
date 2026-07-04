import { formatMaxFileSizeDisplay } from 'Utils/modules/formatters';
import { truncateTitle } from 'Utils/modules/displayCore';
import { ALLOWED_FORMATS, DELETE, LARGE_VIDEO_UPLOAD_GUIDANCE, MEDIA_URL, UPLOAD_MEDIA } from 'Constants/GlobalConstant/Placeholders';
import { builder_upload_large, carousel_large, circle_pause_fill_medium, delete_mini, grid_medium, popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useFormContext, useFormState } from 'react-hook-form';
import { get as _get } from 'Utils/modules/lodashReplacements';
import RSModal from 'Components/RSModal';
import RSTooltip from 'Components/RSTooltip';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSInput from 'Components/FormFields/RSInput';
import RSIcon from 'Components/RSIcon';
import ResDDCustomUpload from 'Pages/KendoDocs/CommonComponents/ResDDCustomUpload';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { ENTER_IMAGE_URL, ENTER_PROPER_URL } from 'Constants/GlobalConstant/ValidationMessage';

import { uploadSocialPostDocuments } from 'Reducers/communication/createCommunication/Create/request';
import { getCommunicationMultiUploadAcceptAttribute, getCommunicationMultiUploadAcceptExtensionsList, GENERIC_MULTI_UPLOAD_MIME_TYPES, getGenericMultiUploadInvalidTypeMessage, getMultiUploadSupportedFormatsExtensionText, getSocialInvalidFileTypeError, getSocialMaxSizeError, getSocialMultiUploadAcceptMimeTypes, probeVideoForSocialValidation, socialMultiUploadAllowsVideoSlides, validateImageAspectRatio, validateImageFileSize, validateImageFormat, validateSocialPostVideoMetadata, validateVideoFileSize, validateVideoFormat, VIDEO_LIKE_DOT_EXTENSIONS, getImageSpecs, SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES } from '../../Tabs/SocialPost/socialMediaConfig';
const MULTI_IMAGE_UPLOAD_LABEL = UPLOAD_MEDIA;
const MULTI_IMAGE_REMOVE_ALL_LABEL = 'Remove all media';

const isVideoLikeFile = (file) =>
    file &&
    ((file.type && file.type.startsWith('video/')) ||
        /\.(mp4|mov|m4v|webm)(\?|#|$)/i.test(String(file.name || '')));

/** Detect video URLs including `data:video/...` (`.mp4` in MIME does not match `\\.mp4` path checks). */
const isVideoLikeRemoteOrDataUrl = (url) => {
    const s = String(url || '');
    if (!s) return false;
    const head = s.slice(0, 160).toLowerCase();
    if (head.startsWith('data:video/')) return true;
    return /\.(mp4|mov|m4v|webm)(\?|#|$)/i.test(s);
};

const normalizeDotExtFromFileName = (fileName) => {
    const raw = String(fileName || '').split('.').pop() || '';
    const lower = raw.toLowerCase();
    return lower ? `.${lower}` : '';
};

const acceptMultiFile = (file, platformType, socialPostType) => {
    if (!file) return false;
    if (socialPostType?.id) {
        const p = platformType || 'facebook';
        const ext = normalizeDotExtFromFileName(file.name);
        const allowedMimes = getSocialMultiUploadAcceptMimeTypes(p, socialPostType);
        const allowedExts = getCommunicationMultiUploadAcceptExtensionsList(p, socialPostType);
        if (allowedMimes.includes(String(file.type || '').toLowerCase())) return true;
        return ext && allowedExts.includes(ext);
    }
    return GENERIC_MULTI_UPLOAD_MIME_TYPES.includes(String(file.type || '').toLowerCase());
};

const multiInvalidTypeMessage = (platformType, socialPostType) => {
    if (socialPostType?.id) {
        const kind = socialMultiUploadAllowsVideoSlides(socialPostType) ? 'story' : 'img';
        return `Selected file(s): ${getSocialInvalidFileTypeError(kind, platformType || 'facebook', socialPostType)}`;
    }
    return getGenericMultiUploadInvalidTypeMessage();
};

const createPreviewBlobUrl = (file) => {
    try {
        const url = URL.createObjectURL(file);
        return typeof url === 'string' ? url : '';
    } catch {
        return '';
    }
};

/** One `uploadSocialPostDocuments` call; `File` parts may mix images and videos (order matches `files`). */
const uploadFilesToServer = async (dispatch, files, { kindLabel }) => {
    if (!files?.length) {
        return { ok: true, urls: [] };
    }
    const formData = new FormData();
    files.forEach((f) => formData.append('File', f, f?.name || 'file'));
    const res = await dispatch(uploadSocialPostDocuments({ payload: formData, loading: false }));
    if (!res?.status) {
        return { ok: false, error: res?.message || `Upload failed (${kindLabel})` };
    }
    const list = Array.isArray(res?.data)
        ? res?.data
        : res?.data && typeof res?.data === 'object'
            ? [res?.data]
            : [];
    const urls = list.map((r) => r?.data?.url || r?.url || r?.filePath || r?.data?.filePath).filter(Boolean);
    if (urls.length !== files.length) {
        return { ok: false, error: `Upload succeeded but missing URL(s) for ${kindLabel}` };
    }
    return { ok: true, urls };
};

const validateMultiItemFile = (file, platformType, socialPostType = null) =>
    new Promise((resolve) => {
        const platform = platformType || 'facebook';
        if (socialMultiUploadAllowsVideoSlides(socialPostType) && isVideoLikeFile(file)) {
            const formatValidation = validateVideoFormat(file.name, platform, socialPostType);
            if (!formatValidation.isValid) {
                resolve({ ok: false, error: `${file.name}: ${formatValidation.message}` });
                return;
            }
            const sizeValidation = validateVideoFileSize(file.size, platform, socialPostType);
            if (!sizeValidation.isValid) {
                resolve({ ok: false, error: `${file.name}: ${sizeValidation.message}` });
                return;
            }
            if (file.size > SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES) {
                resolve({ ok: false, error: `${file.name}: ${getSocialMaxSizeError('video', SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES)}` });
                return;
            }
            const objUrl = URL.createObjectURL(file);
            probeVideoForSocialValidation(objUrl, { revokeIfBlobUrl: true }).then((dims) => {
                if (!dims) {
                    resolve({ ok: false, error: `${file.name}: Failed to load video for validation` });
                    return;
                }
                const meta = validateSocialPostVideoMetadata(dims.w, dims.h, dims.d, platform, socialPostType);
                if (!meta.isValid) {
                    resolve({ ok: false, error: `${file.name}: ${meta.message}` });
                    return;
                }
                resolve({ ok: true });
            });
            return;
        }

        const formatValidation = validateImageFormat(file.name, platform, socialPostType);
        if (!formatValidation.isValid) {
            resolve({ ok: false, error: `${file.name}: ${formatValidation.message}` });
            return;
        }
        const sizeValidation = validateImageFileSize(file.size, platform, socialPostType);
        if (!sizeValidation.isValid) {
            resolve({ ok: false, error: `${file.name}: ${sizeValidation.message}` });
            return;
        }
        if (file.size > SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES) {
            resolve({ ok: false, error: `${file.name}: ${getSocialMaxSizeError('img', SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES)}` });
            return;
        }
        const objUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(objUrl);
            const aspectValidation = validateImageAspectRatio(img.width, img.height, platform, socialPostType);
            if (!aspectValidation.isValid) {
                resolve({ ok: false, error: `${file.name}: ${aspectValidation.message}` });
                return;
            }
            resolve({ ok: true });
        };
        img.onerror = () => {
            URL.revokeObjectURL(objUrl);
            resolve({ ok: false, error: `${file.name}: Failed to load image for validation` });
        };
        img.src = objUrl;
    });

const validateUrlAsVideoMeta = (url) =>
    probeVideoForSocialValidation(String(url), { revokeIfBlobUrl: false, maxWaitMs: 20000 }).then((dims) =>
        dims && dims.w && dims.h
            ? { width: dims.w, height: dims.h, duration: Number.isFinite(dims.d) ? dims.d : 0 }
            : null,
    );

const validateMultiItemUrl = (url, platformType, socialPostType = null) =>
    new Promise((resolve) => {
        const platform = platformType || 'facebook';
        const name = String(url).split('/').pop()?.split('?')[0] || 'image';
        const isProbablyVideo = /\.(mp4|mov|m4v)(\?|$)/i.test(String(url));

        if (socialMultiUploadAllowsVideoSlides(socialPostType) && isProbablyVideo) {
            validateUrlAsVideoMeta(url).then(async (meta) => {
                if (!meta?.width) {
                    resolve({ ok: false, error: `${name}: Could not load video from URL for validation` });
                    return;
                }
                const formatValidation = validateVideoFormat(name, platform, socialPostType);
                if (!formatValidation.isValid) {
                    resolve({ ok: false, error: `${name}: ${formatValidation.message}` });
                    return;
                }
                const geo = validateSocialPostVideoMetadata(meta.width, meta.height, meta.duration, platform, socialPostType);
                if (!geo.isValid) {
                    resolve({ ok: false, error: `${name}: ${geo.message}` });
                    return;
                }
                resolve({ ok: true });
            });
            return;
        }

        const formatValidation = validateImageFormat(name, platform, socialPostType);
        if (!formatValidation.isValid) {
            resolve({ ok: false, error: `${name}: ${formatValidation.message}` });
            return;
        }
        const img = new Image();
        img.onload = () => {
            const aspectValidation = validateImageAspectRatio(img.width, img.height, platform, socialPostType);
            if (!aspectValidation.isValid) {
                resolve({ ok: false, error: `${name}: ${aspectValidation.message}` });
                return;
            }
            resolve({ ok: true });
        };
        img.onerror = () => {
            resolve({ ok: false, error: `${name}: Failed to load image for validation` });
        };
        img.src = url;
    });

const readDirectoryEntries = (dirReader) =>
    new Promise((resolve, reject) => {
        const all = [];
        const readBatch = () => {
            dirReader.readEntries(
                (entries) => {
                    if (!entries.length) {
                        resolve(all);
                        return;
                    }
                    all.push(...entries);
                    readBatch();
                },
                reject
            );
        };
        readBatch();
    });

const collectFilesFromEntry = async (entry, bucket, maxCount, platformType, socialPostType) => {
    if (bucket.length >= maxCount) return;
    if (entry.isFile) {
        await new Promise((resolve) => {
            entry.file((file) => {
                if (acceptMultiFile(file, platformType, socialPostType) && bucket.length < maxCount) {
                    bucket.push(file);
                }
                resolve();
            });
        });
    } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await readDirectoryEntries(reader);
        for (const e of entries) {
            await collectFilesFromEntry(e, bucket, maxCount, platformType, socialPostType);
            if (bucket.length >= maxCount) break;
        }
    }
};

const reorderWithPointer = (items, fromIndex, hoverIndex, insertAfter) => {
    const n = items.length;
    if (n <= 1 || fromIndex < 0 || fromIndex >= n) return items;
    let toRaw = insertAfter ? hoverIndex + 1 : hoverIndex;
    let to = toRaw;
    if (fromIndex < to) to -= 1;
    to = Math.max(0, Math.min(to, n - 1));
    if (fromIndex === to) return items;
    const next = [...items];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(to, 0, removed);
    return next;
};

let mediaIdSeq = 0;
const createMediaId = () => `img-${Date.now()}-${++mediaIdSeq}`;

/** Splits `filename: message` from validateMultiItemFile / validateMultiItemUrl for display like single ImageUpload. */
const splitValidationErrorLine = (errorLine) => {
    if (!errorLine || typeof errorLine !== 'string') {
        return { title: '', detail: '' };
    }
    const sep = ': ';
    const i = errorLine.indexOf(sep);
    if (i <= 0) {
        return { title: 'Image', detail: errorLine };
    }
    return { title: errorLine.slice(0, i), detail: errorLine.slice(i + sep.length) };
};

const getMultiUrlFieldName = (isSplit, fieldName) =>
    isSplit && fieldName ? `${fieldName}.multiImageAddByUrl` : 'multiImageAddByUrl';

const validateUrlAsImage = (url) =>
    new Promise((resolve) => {
        const img = new Image();
        const t = setTimeout(() => {
            img.onload = null;
            img.onerror = null;
            resolve(false);
        }, 15000);
        img.onload = () => {
            clearTimeout(t);
            resolve(true);
        };
        img.onerror = () => {
            clearTimeout(t);
            resolve(false);
        };
        img.src = url;
    });

const isValidHttpUrl = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return false;
    try {
        const parsed = new URL(raw);
        return /^https?:$/i.test(parsed.protocol);
    } catch {
        return false;
    }
};

const getAllowedUrlExtensionsForMulti = (platformType, socialPostType) =>
    getCommunicationMultiUploadAcceptExtensionsList(platformType, socialPostType);

const getUrlExtension = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    const noQuery = raw.split('?')[0].split('#')[0];
    if (!noQuery.includes('.')) return '';
    return `.${noQuery.split('.').pop()}`;
};

const MultiImageUpload = ({
    isSplit,
    fieldName,
    InsertImage = () => { },
    maxImages = 1,
    onCommittedImages,
    /** When set (e.g. social channel id: `facebook`), applies same rules as single-image upload. */
    platformType,
    /** Post-type card (`postType` from form); enables Instagram carousel MP4/MOV and correct aspect/size rules. */
    socialPostType = null,
    /** Rebind carousel when reopening the modal (`{ name, src }[]` from parent state). */
    initialGallery = [],
    /** Increment (e.g. after post-type card select) to open the upload modal without using the toolbar icon. */
    autoOpenUploadKey = 0,
    /**
     * Called right after opening from `autoOpenUploadKey`. Parent should reset the key (e.g. to 0);
     * otherwise a remount from a new `key=` prop can see a stale non-zero key and open the modal again
     * (e.g. social post edit load changing `postType` / resetKey).
     */
    onAutoOpenUploadConsumed,
    /** When true, hides the toolbar trigger icon/menu (modal can still open via `autoOpenUploadKey`). */
    hideDefaultTrigger = false,
    /** Max file size in bytes (same meaning as {@link ImageUpload} `size` / `maxSize`). */
    size = null,
    maxSize = null,
}) => {
    const effectiveMaxBytes =
        maxSize ??
        size ??
        (platformType && socialPostType ? getImageSpecs(platformType, socialPostType).maxFileSize : null);
    /** Modal copy: social multi/carousel uploads always show the RESUL 30 MB cap (not per-network doc limits). */
    const uploadModalMaxBytes = platformType
        ? SOCIAL_PLATFORM_CLIENT_UPLOAD_MAX_BYTES
        : effectiveMaxBytes;
    const isMulti = maxImages > 1;
    const dispatch = useDispatch();
    const { control, clearErrors, setError, watch, getFieldState, getValues, trigger, setValue, formState } =
        useFormContext();
    const committedGalleryCount = initialGallery?.length ?? 0;
    /** Remove listed first so it appears at the top of the menu; a separate trash icon is also shown when the gallery is non-empty. */
    const imageDropdownData = useMemo(
        () =>
            [MULTI_IMAGE_UPLOAD_LABEL, MULTI_IMAGE_REMOVE_ALL_LABEL],
        [committedGalleryCount],
    );
    const multiDropdownDisableItems = useMemo(
        () => (committedGalleryCount > 0 ? [] : [MULTI_IMAGE_REMOVE_ALL_LABEL]),
        [committedGalleryCount],
    );
    const [isUpload, setUpload] = useState({
        show: false,
        type: null,
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [thumbPreviews, setThumbPreviews] = useState([]);
    const [addByUrlError, setAddByUrlError] = useState('');
    const [isUploaded, setIsUploaded] = useState(false);
    const [isFileInvalid, setIsFileInvalid] = useState(false);
    const [isUploadingNow, setIsUploadingNow] = useState(false);
    const [thumbReorderFrom, setThumbReorderFrom] = useState(null);
    const [thumbReorderOver, setThumbReorderOver] = useState(null);
    const [thumbInsertAfter, setThumbInsertAfter] = useState(false);
    /** Local copy of multi-upload errors — RHF `errors` can fail to re-render inside bootstrap Modal. */
    const [multiCommitError, setMultiCommitError] = useState('');
    /** Per-item validation UI (same pattern as single-image: file row + message below). */
    const [stagedValidationErrors, setStagedValidationErrors] = useState([]);
    /** Keeps latest length for async add flows (browse/drop) so room math is not stale. */
    const selectedMediaRef = useRef([]);
    const prevMultiModalOpenRef = useRef(false);
    const { show, type } = isUpload;
    const previewImageName = isSplit ? `${fieldName}.previewImage` : 'previewImage';
    const inputUrlName = isSplit ? `${fieldName}.inputUrl` : 'inputUrl';
    const uploadImageName = isSplit ? `${fieldName}.uploadImageName` : 'uploadImageName';
    const multiUrlFieldName = getMultiUrlFieldName(isSplit, fieldName);
    const inputUrl = watch(inputUrlName, '');
    const multiUrlValue = watch(multiUrlFieldName, '');
    const [isImageRemove, setIsImageRemove] = useState(false)

    const { errors } = useFormState({ control });
    const uploadImageError = _get(errors, uploadImageName);
    const showLargeVideoUploadGuidance = socialMultiUploadAllowsVideoSlides(socialPostType);

    useEffect(() => {
        if (!autoOpenUploadKey) return;
        clearErrors();
        setMultiCommitError('');
        setStagedValidationErrors([]);
        setUpload({
            show: true,
            type: 'imageUpload',
        });
        onAutoOpenUploadConsumed?.();
    }, [autoOpenUploadKey, clearErrors, onAutoOpenUploadConsumed]);

    useEffect(() => {
        selectedMediaRef.current = selectedMedia;
    }, [selectedMedia]);

    /** Restore thumbnails when reopening multi-image upload after images were already committed. */
    useEffect(() => {
        const justOpened = show && !prevMultiModalOpenRef.current;
        prevMultiModalOpenRef.current = show;
        if (!justOpened || type !== 'imageUpload' || !isMulti) {
            return;
        }
        const items = initialGallery || [];
        if (!items.length) {
            setSelectedMedia([]);
            setMultiCommitError('');
            setStagedValidationErrors([]);
            return;
        }
        setSelectedMedia(
            items
                .map((img) => {
                    const src = img?.src || '';
                    if (!String(src).trim()) {
                        return null;
                    }
                    const inferredKind =
                        img?.mediaKind === 'video' || img?.mediaKind === 'image'
                            ? img.mediaKind
                            : isVideoLikeRemoteOrDataUrl(src)
                                ? 'video'
                                : 'image';
                    return {
                        id: createMediaId(),
                        kind: 'url',
                        url: src,
                        mediaKind: inferredKind,
                    };
                })
                .filter(Boolean)
        );
        setMultiCommitError('');
        setStagedValidationErrors([]);
    }, [show, type, isMulti, initialGallery]);

    useEffect(() => {
        if (!isMulti) {
            setThumbPreviews([]);
            return undefined;
        }
        const generated = [];
        const urls = selectedMedia.map((item) => {
            if (item.kind === 'file') {
                if (item.previewUrl) {
                    return item.previewUrl;
                }
                const blobUrl = URL.createObjectURL(item.file);
                generated.push(blobUrl);
                return blobUrl;
            }
            return item.url;
        });
        setThumbPreviews(urls);
        return () => {
            generated.forEach((u) => {
                if (typeof u === 'string' && u.startsWith('blob:')) {
                    URL.revokeObjectURL(u);
                }
            });
        };
    }, [isMulti, selectedMedia]);

    const resetFileInput = () => {
        const el = document.getElementById('dragDropFileInputMultiImage');
        if (el) el.value = '';
    };

    const removeStagedValidationError = (id) => {
        setStagedValidationErrors((prev) => prev.filter((row) => row.id !== id));
    };

    const appendStagedValidationErrorsFromLines = (errorLines) => {
        const rows = errorLines
            .filter(Boolean)
            .map((line) => {
                const { title, detail } = splitValidationErrorLine(line);
                return {
                    id: createMediaId(),
                    title: title || 'Image',
                    message: detail || line,
                };
            });
        if (!rows.length) return;
        setStagedValidationErrors((prev) => [...prev, ...rows]);
    };

    const handleClose = (shouldClear = false) => {
        if (shouldClear) {
            setValue(uploadImageName, '');
            setValue(previewImageName, '');
            setValue(inputUrlName, '');
            setValue('previewName', '');
            setValue(multiUrlFieldName, '');
        }
        setSelectedFiles([]);
        setSelectedMedia([]);
        setThumbPreviews([]);
        setAddByUrlError('');
        setIsUploaded(false);
        setIsFileInvalid(false);
        setUpload({
            show: false,
            type: null,
        });
        clearErrors();
        setMultiCommitError('');
        setStagedValidationErrors([]);
        setThumbReorderFrom(null);
        setThumbReorderOver(null);
        setThumbInsertAfter(false);
        resetFileInput();
        setIsImageRemove(false)
    };

    const handleSave = () => {
        setUpload({
            show: false,
            type: null,
        });
    };

    const processSingleMultiUploadFile = async (file) => {
        if (!file) return;

        if (!acceptMultiFile(file, platformType, socialPostType)) {
            setSelectedFiles([file]);
            setIsFileInvalid(true);
            setError(uploadImageName, {
                type: 'custom',
                message: multiInvalidTypeMessage(platformType, socialPostType),
            });
            return;
        }

        setSelectedFiles([file]);
        setIsFileInvalid(false);
        clearErrors(uploadImageName);
        setValue(inputUrlName, '');

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result;
            setValue(uploadImageName, base64String);
            setValue(previewImageName, base64String);
            setValue('previewName', file.name);
            setIsUploaded(true);
            setIsFileInvalid(false);
        };
        reader.readAsDataURL(file);
    };

    const handleResDDFilesSelect = async (results) => {
        if (!isMulti) return;
        const files = (results || []).map((row) => row.file).filter(Boolean);
        await applyMultiFilesWithValidation(files, false);
    };

    const handleResDDFileSelect = async (file) => {
        if (!isMulti) {
            await processSingleMultiUploadFile(file);
        }
    };

    const applyMultiFilesWithValidation = async (incomingFiles, invalidShown) => {
        if (!incomingFiles.length) {
            if (invalidShown) {
                setIsFileInvalid(true);
                appendStagedValidationErrorsFromLines([multiInvalidTypeMessage(platformType, socialPostType)]);
            }
            return;
        }
        setIsFileInvalid(false);
        clearErrors(uploadImageName);
        setMultiCommitError('');
        setStagedValidationErrors([]);

        const room = maxImages - selectedMediaRef.current.length;
        if (room <= 0) {
            return;
        }
        const toProcess = incomingFiles.slice(0, room);
        const channelKey = platformType || 'facebook';
        const results = await Promise.all(
            toProcess.map((file) => validateMultiItemFile(file, channelKey, socialPostType))
        );
        const failed = results.filter((r) => !r.ok);
        const additions = toProcess.filter((_, i) => results[i].ok);

        if (failed.length) {
            appendStagedValidationErrorsFromLines(failed.map((r) => r.error).filter(Boolean));
        }

        if (additions.length) {
            setValue(inputUrlName, '');

            // Stage each item immediately so user gets per-image loading feedback.
            const stagedItems = additions.map((file) => ({
                id: createMediaId(),
                kind: 'file',
                file,
                previewUrl: createPreviewBlobUrl(file),
                mediaKind: isVideoLikeFile(file) ? 'video' : 'image',
            }));
            setSelectedMedia((prev) => [...prev, ...stagedItems]);

            setIsUploadingNow(true);
            try {
                const uploadErrors = [];
                let successCount = 0;

                for (let i = 0; i < additions.length; i++) {
                    const file = additions[i];
                    const stagedId = stagedItems[i]?.id;
                    const uploadedRes = await uploadFilesToServer(dispatch, [file], {
                        kindLabel: file?.name || 'media',
                    });

                    if (!uploadedRes.ok || !uploadedRes.urls?.[0]) {
                        uploadErrors.push(uploadedRes.error || `${file?.name || 'Media'} upload failed`);
                        if (stagedId) {
                            setSelectedMedia((prev) => prev.filter((item) => item.id !== stagedId));
                        }
                        continue;
                    }

                    const isVid = isVideoLikeFile(file);
                    const committedItem = {
                        id: stagedId || createMediaId(),
                        kind: 'url',
                        url: uploadedRes.urls[0],
                        mediaKind: isVid ? 'video' : 'image',
                    };

                    setSelectedMedia((prev) =>
                        prev.map((item) => (item.id === committedItem.id ? committedItem : item)),
                    );
                    successCount += 1;
                }

                if (successCount > 0) {
                    setIsUploaded(true);
                }
                if (uploadErrors.length) {
                    const msg = uploadErrors.join(', ');
                    setMultiCommitError(msg);
                    appendStagedValidationErrorsFromLines(uploadErrors);
                }
            } catch (e) {
                const msg =
                    e && typeof e?.message === 'string' && e.message ? e.message : 'Upload failed';
                const stagedIds = new Set(stagedItems.map((item) => item.id));
                setSelectedMedia((prev) => prev.filter((item) => !stagedIds.has(item.id)));
                setMultiCommitError(msg);
                appendStagedValidationErrorsFromLines([msg]);
            } finally {
                setIsUploadingNow(false);
            }
        }
    };

    const dragBlocked = isMulti
        ? selectedMedia.length >= maxImages
        : !!inputUrl || selectedFiles.length > 0;

    const removeMediaAt = (index) => {
        if (isMulti) {
            // Only change staged thumbnails; do not clear RHF primary fields — those still
            // reflect the last committed gallery until the user clicks Upload. Clearing them
            // here made Cancel/reopen look like the whole carousel "reverted" or broke preview.
            setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
            setMultiCommitError('');
            setStagedValidationErrors([]);
            resetFileInput();
            setThumbReorderFrom(null);
            setThumbReorderOver(null);
            setThumbInsertAfter(false);
            setIsImageRemove(true)
            return;
        }
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setIsUploaded(false);
        setIsFileInvalid(false);
        setValue(uploadImageName, '');
        setValue(previewImageName, '');
        clearErrors(uploadImageName);
        setMultiCommitError('');
        setStagedValidationErrors([]);
        resetFileInput();
        setThumbReorderFrom(null);
        setThumbReorderOver(null);
        setThumbInsertAfter(false);
    };

    const handleAddUrlSubmit = async () => {
        setAddByUrlError('');
        const trimmed = String(getValues(multiUrlFieldName) || '').trim();
        if (!trimmed) {
            trigger(multiUrlFieldName)
            return;
        }
        try {
            const parsed = new URL(trimmed);
            if (!/^https?:$/i.test(parsed.protocol)) {
                setAddByUrlError(ENTER_PROPER_URL);
                return;
            }
        } catch {
            setAddByUrlError(ENTER_PROPER_URL);
            return;
        }
        if (selectedMedia.length >= maxImages) {
            return;
        }
        const allowedExt = getAllowedUrlExtensionsForMulti(platformType, socialPostType);
        const ext = getUrlExtension(trimmed);
        const acceptsVideoUrl = allowedExt.some((x) => VIDEO_LIKE_DOT_EXTENSIONS.includes(x));
        const isVideoUrlByAllowedExt = !!ext && VIDEO_LIKE_DOT_EXTENSIONS.includes(ext);
        if (ext && !allowedExt.includes(ext)) {
            setAddByUrlError(
                `${ALLOWED_FORMATS} ${getMultiUploadSupportedFormatsExtensionText(platformType, socialPostType)}`,
            );
            return;
        }
        const channelKey = platformType || 'facebook';
        if (socialPostType?.id === 'pinterest_carousel_pin' && isVideoLikeRemoteOrDataUrl(trimmed)) {
            setAddByUrlError('Pinterest carousel pins accept image URLs only (JPG/PNG).');
            return;
        }
        if (!(acceptsVideoUrl && isVideoUrlByAllowedExt)) {
            const loads = await validateUrlAsImage(trimmed);
            if (!loads) {
                setAddByUrlError('Unable to load image from this URL');
                return;
            }
        }

        const urlCheck = await validateMultiItemUrl(trimmed, channelKey, socialPostType);
        if (!urlCheck.ok) {
            appendStagedValidationErrorsFromLines([urlCheck.error || 'Image validation failed']);
            return;
        }
        setSelectedMedia((prev) => {
            if (prev.length >= maxImages) return prev;
            return [
                ...prev,
                {
                    id: createMediaId(),
                    kind: 'url',
                    url: trimmed,
                    mediaKind: isVideoLikeRemoteOrDataUrl(trimmed) ? 'video' : 'image',
                },
            ];
        });
        setValue(multiUrlFieldName, '');
        clearErrors(multiUrlFieldName);
        setMultiCommitError('');
        setIsUploaded(true);
    };

    const handleThumbDragStart = (e, index) => {
        setThumbReorderFrom(index);
        e.dataTransfer.setData('text/plain', String(index));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleThumbDragEnd = () => {
        setThumbReorderFrom(null);
        setThumbReorderOver(null);
        setThumbInsertAfter(false);
    };

    const updateThumbDragOverFromEvent = (e, index) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const insertAfter = e.clientX >= rect.left + rect.width / 2;
        setThumbReorderOver(index);
        setThumbInsertAfter(insertAfter);
    };

    const handleThumbDrop = (e, hoverIndex) => {
        e.preventDefault();
        e.stopPropagation();
        const fromStr = e.dataTransfer.getData('text/plain');
        const from = fromStr !== '' ? parseInt(fromStr, 10) : thumbReorderFrom;
        if (Number.isNaN(from)) {
            handleThumbDragEnd();
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const insertAfter = e.clientX >= rect.left + rect.width / 2;
        if (isMulti) {
            setSelectedMedia((prev) => reorderWithPointer(prev, from, hoverIndex, insertAfter));
        } else {
            setSelectedFiles((prev) => reorderWithPointer(prev, from, hoverIndex, insertAfter));
        }
        handleThumbDragEnd();
    };

    const handleRemoveAllCommitted = useCallback(() => {
        onCommittedImages?.([]);
        setValue(uploadImageName, '');
        setValue(previewImageName, '');
        setValue('browserImage', '');
        if (isSplit && fieldName) {
            setValue(`${fieldName}.uploadImage`, '');
        } else {
            setValue('uploadImage', '');
        }
        setValue('previewName', '');
        setValue(inputUrlName, '');
        setValue(multiUrlFieldName, '');
        setSelectedMedia([]);
        clearErrors(uploadImageName);
        clearErrors('previewImage');
        InsertImage(true);
    }, [
        InsertImage,
        clearErrors,
        fieldName,
        isSplit,
        multiUrlFieldName,
        onCommittedImages,
        previewImageName,
        setValue,
        uploadImageName,
        inputUrlName,
    ]);

    const isUploadDisabled = () => {
        const hasErrors = Object.keys(formState?.errors || {}).length > 0;
        const noMedia = !selectedMedia?.length;
        if (hasErrors && !isImageRemove && !selectedMedia?.length) return true;
        if (!isUploaded && !isImageRemove) return true;
        if(noMedia && !isImageRemove) return true
        return false;
    };

    const uploadTooltipText =
        socialMultiUploadAllowsVideoSlides(socialPostType)
            ? committedGalleryCount > 0
                ? 'Add photos or videos (menu)'
                : 'Upload photos or videos'
            : socialPostType?.id === 'pinterest_carousel_pin'
                ? committedGalleryCount > 0
                    ? 'Add carousel images (menu)'
                    : 'Upload 2–5 images (2:3)'
                : committedGalleryCount > 0
                    ? 'Add more media (menu)'
                    : 'Upload media';

    /** Avoid the single-image (mountain) glyph here — multi post types use grid/carousel only. */
    const multiUploadToolbarIconClass =
        socialMultiUploadAllowsVideoSlides(socialPostType) ? carousel_large : grid_medium;

    const uploadPrimaryDisabled = isMulti
        ? selectedMedia.length === 0 || isUploadingNow
        : !(isUploaded || selectedFiles.length > 0 || !!String(inputUrl || '').trim());

    const uploadingMediaIds = useMemo(
        () => new Set(selectedMedia.filter((item) => item.kind === 'file').map((item) => item.id)),
        [selectedMedia],
    );

    const addUrlButtonDisabled =
        !isValidHttpUrl(multiUrlValue) ||
        !!addByUrlError ||
        getFieldState(multiUrlFieldName).invalid ||
        (isMulti && selectedMedia.length >= maxImages);

    const multiModalSupportedHints = useMemo(
        () => (
            <small className="d-block">
                {`${ALLOWED_FORMATS} ${getMultiUploadSupportedFormatsExtensionText(platformType, socialPostType)}`}
            </small>
        ),
        [platformType, socialPostType],
    );

    const getMultiUploadModalHeader = () => {
        if (type === 'imageUpload' || type === 'browse') {
            return UPLOAD_MEDIA;
        }
        return MEDIA_URL;
    };

    return (
        <Fragment>
            {!hideDefaultTrigger ? (
                <span className="d-inline-flex align-items-center gap-1">
                    <RSBootstrapdown
                        key={`multi-img-dd-${committedGalleryCount}`}
                        data={imageDropdownData}
                        defaultItem={
                            <RSTooltip text={uploadTooltipText} position="top" className="lh0">
                                <i className={`${multiUploadToolbarIconClass} icon-md`} />
                            </RSTooltip>
                        }
                        className="no_caret"
                        showUpdate={false}
                        disbleItems={multiDropdownDisableItems}
                        onSelect={(text) => {
                            if (text === MULTI_IMAGE_UPLOAD_LABEL) {
                                clearErrors();
                                setMultiCommitError('');
                                setStagedValidationErrors([]);
                                setUpload({
                                    show: true,
                                    type: 'imageUpload',
                                });
                            } else if (text === MULTI_IMAGE_REMOVE_ALL_LABEL) {
                                handleRemoveAllCommitted();
                            } else if (text === 'Browse image') {
                                clearErrors();
                                setMultiCommitError('');
                                setUpload({
                                    show: true,
                                    type: 'browse',
                                });
                            } else if (text === 'Image URL' || text === MEDIA_URL) {
                                clearErrors();
                                setMultiCommitError('');
                                setUpload({
                                    show: true,
                                    type: 'media',
                                });
                            }
                        }}
                    />
                </span>
            ) : null}
            <RSModal
                show={show}
                size={'md'}
                header={getMultiUploadModalHeader()}
                handleClose={handleClose}
                body={
                    <div className="image-upload-wrapper">
                        {type === 'imageUpload' ? (
                            <Fragment>
                                <ResDDCustomUpload
                                    inputId="dragDropFileInputMultiImage"
                                    accept={getCommunicationMultiUploadAcceptAttribute(platformType, socialPostType)}
                                    isMultiFileUpload={isMulti}
                                    maxFiles={isMulti ? Math.max(0, maxImages - selectedMedia.length) : undefined}
                                    useExternalValidation
                                    disabled={dragBlocked}
                                    formatsHint={multiModalSupportedHints}
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
                                    selectedFile={!isMulti && selectedFiles[0] ? selectedFiles[0] : null}
                                    isFileInvalid={!isMulti && isFileInvalid}
                                    isProcessing={isUploadingNow}
                                    errorMessage={
                                        !isMulti &&
                                        uploadImageError &&
                                        typeof uploadImageError.message === 'string'
                                            ? uploadImageError.message
                                            : ''
                                    }
                                    iconClassName={`${builder_upload_large} icon-xl color-primary-blue`}
                                    onFilesSelect={handleResDDFilesSelect}
                                    onFileSelect={handleResDDFileSelect}
                                    onRemoveFile={() => removeMediaAt(0)}
                                    onClear={() => removeMediaAt(0)}
                                />

                                {isMulti && stagedValidationErrors.length > 0 ? (
                                    <div className="multi-staged-validation-errors mt10">
                                        {stagedValidationErrors.map((row) => (
                                            <div key={row.id} className="mb10">
                                                <div className="selected-file-info position-relative file-invalid">
                                                    {row.title.length > 43 ? (
                                                        <RSTooltip text={row.title} position="top">
                                                            <span className="file-name">
                                                                {truncateTitle(row.title, 43)}
                                                            </span>
                                                        </RSTooltip>
                                                    ) : (
                                                        <span className="file-name">{row.title}</span>
                                                    )}
                                                    <RSIcon
                                                        className="icon-sm color-primary-red"
                                                        defaultItem={popup_close_circle_medium}
                                                        hoverItem={popup_close_circle_fill_medium}
                                                        handleClose={() => removeStagedValidationError(row.id)}
                                                        normalIcon
                                                        customCloseClass="lh0 position-absolute right5 top5"
                                                    />
                                                </div>
                                                <small className="err-msg color-primary-red d-block mt5">
                                                    {row.message}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                <div className="divider">
                                    <div className="mask"></div>
                                    <span>or</span>
                                </div>

                                {isMulti && (
                                    <Fragment>
                                        <div
                                            className={`mt10 image-upload-url-row w-100 ${selectedMedia.length >= maxImages ? 'click-off pe-none' : ''}`}
                                        >
                                            <div className="image-upload-url-rsinput-row d-flex w-100">
                                                <div className="image-upload-url-rsinput-field flex-grow-1 min-width-0">
                                                    <RSInput
                                                        control={control}
                                                        name={multiUrlFieldName}
                                                        defaultValue=""
                                                        type="url"
                                                        placeholder={MEDIA_URL}
                                                        handleOnchange={() => {
                                                            setAddByUrlError('');
                                                            clearErrors(multiUrlFieldName);
                                                        }}
                                                        handleOnBlur={(e) => {
                                                            if (!!e.target.value) {
                                                                trigger(multiUrlFieldName);
                                                            }
                                                        }}
                                                        handleOnPaste={(e) => {
                                                            e.preventDefault();
                                                            const pastedData = e.clipboardData.getData('text');
                                                            if (!!pastedData) {
                                                                setValue(multiUrlFieldName, pastedData);
                                                                setTimeout(async () => {
                                                                    await trigger(multiUrlFieldName);
                                                                }, 100);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddUrlSubmit();
                                                            }
                                                        }}
                                                        rules={{
                                                            required: ENTER_IMAGE_URL,
                                                            validate: (url) => {
                                                                const value = String(url || '').trim();
                                                                if (!value) return true;
                                                                if (!isValidHttpUrl(value)) {
                                                                    return ENTER_PROPER_URL;
                                                                }
                                                                const allowedExt = getAllowedUrlExtensionsForMulti(platformType, socialPostType);
                                                                const ext = getUrlExtension(value);
                                                                const acceptsVideoUrl = allowedExt.some((x) =>
                                                                    VIDEO_LIKE_DOT_EXTENSIONS.includes(x),
                                                                );
                                                                const isVideoUrlByAllowedExt =
                                                                    !!ext && VIDEO_LIKE_DOT_EXTENSIONS.includes(ext);
                                                                if (ext && !allowedExt.includes(ext)) {
                                                                    return `${ALLOWED_FORMATS} ${getMultiUploadSupportedFormatsExtensionText(platformType, socialPostType)}`;
                                                                }

                                                                if (acceptsVideoUrl && isVideoUrlByAllowedExt) {
                                                                    return validateUrlAsVideoMeta(value).then((meta) => {
                                                                        if (meta?.width) {
                                                                            return true;
                                                                        }
                                                                        return 'Enter valid video URL';
                                                                    });
                                                                }

                                                                return validateUrlAsImage(value).then((isValid) => {
                                                                    if (isValid) {
                                                                        return true;
                                                                    }
                                                                    return acceptsVideoUrl
                                                                        ? 'Enter valid image or video URL'
                                                                        : 'Enter valid image URL';
                                                                });
                                                            },
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div className="image-upload-url-add-cell flex-shrink-0 ml20">
                                                    <RSPrimaryButton
                                                        type="button"
                                                        className="image-upload-add-url-btn"
                                                        disabledClass={addUrlButtonDisabled ? 'pe-none click-off' : ''}
                                                        onClick={() => {
                                                            if (addUrlButtonDisabled) return;
                                                            handleAddUrlSubmit();
                                                        }}
                                                    >
                                                        Add
                                                    </RSPrimaryButton>
                                                </div>
                                            </div>
                                            <small className="supported-formats-text d-block mt2">
                                                {multiModalSupportedHints}
                                            </small>
                                            {addByUrlError ? (
                                                <small className="err-msg color-primary-red lh-sm mt10">
                                                    {addByUrlError}
                                                </small>
                                            ) : null}
                                        </div>
                                        {selectedMedia.length > 0 && (
                                            <div
                                                className={`multi-image-thumbnails mt15${thumbReorderFrom !== null ? ' is-thumb-reorder-active' : ''}`}
                                            >
                                                {selectedMedia.map((item, index) => {
                                                    const thumbIsVideo =
                                                        item.mediaKind === 'video' ||
                                                        (item.kind === 'file' && isVideoLikeFile(item.file)) ||
                                                        (item.kind === 'url' && isVideoLikeRemoteOrDataUrl(item.url));
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className={`multi-thumb-item ${thumbReorderFrom === index ? 'is-thumb-dragging' : ''}${thumbReorderFrom !== null && thumbReorderOver === index
                                                                ? thumbInsertAfter
                                                                    ? ' is-thumb-drop-after'
                                                                    : ' is-thumb-drop-before'
                                                                : ''
                                                                }`}
                                                            draggable
                                                            onDragStart={(e) => handleThumbDragStart(e, index)}
                                                            onDragEnd={handleThumbDragEnd}
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                e.dataTransfer.dropEffect = 'move';
                                                                updateThumbDragOverFromEvent(e, index);
                                                            }}
                                                            onDrop={(e) => handleThumbDrop(e, index)}
                                                        >
                                                            <div className="multi-thumb-item__body">
                                                                {thumbIsVideo ? (
                                                                    <Fragment>
                                                                        <video
                                                                            src={thumbPreviews[index] || ''}
                                                                            muted
                                                                            playsInline
                                                                            preload="metadata"
                                                                            draggable={false}
                                                                            controls={false}
                                                                        />
                                                                        <span
                                                                            className="multi-thumb-item__video-overlay"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <i
                                                                                className={`${circle_pause_fill_medium} icon-sm color-white`}
                                                                            />
                                                                        </span>
                                                                    </Fragment>
                                                                ) : (
                                                                    <img
                                                                        src={thumbPreviews[index] || ''}
                                                                        alt=""
                                                                        draggable={false}
                                                                    />
                                                                )}
                                                                {uploadingMediaIds.has(item.id) ? (
                                                                    <div
                                                                        className="position-absolute d-flex align-items-center justify-content-center"
                                                                        style={{
                                                                            inset: 0,
                                                                            background: 'rgba(0,0,0,0.45)',
                                                                            zIndex: 2,
                                                                        }}
                                                                    >
                                                                        <div className="text-white font-weight-bold">
                                                                            Uploading...
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                            <div
                                                                className="multi-thumb-item__delete-overlay"
                                                                draggable={false}
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                onDragStart={(e) => e.preventDefault()}
                                                            >
                                                                <span
                                                                    draggable={false}
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                >
                                                                    <RSIcon
                                                                        className="icon-sm  color-primary-red top10"
                                                                        defaultItem={delete_mini}
                                                                        hoverItem={delete_mini}
                                                                        placeholderText={DELETE}
                                                                        handleClose={() => removeMediaAt(index)}
                                                                        customCloseClass=""
                                                                        normalIcon
                                                                        closeTooltipPosition="top"
                                                                        innerCloseContent={false}
                                                                    />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Fragment>
                                )}
                                {(() => {
                                    const rhfMsg =
                                        uploadImageError &&
                                            typeof uploadImageError.message === 'string' &&
                                            uploadImageError.message
                                            ? uploadImageError.message
                                            : '';
                                    const rhfMsgDisplay =
                                        isMulti && stagedValidationErrors.length ? '' : rhfMsg;
                                    const showMsg = multiCommitError || rhfMsgDisplay;
                                    return showMsg ? (
                                        <small className="err-msg color-primary-red d-block mt15">
                                            {showMsg}
                                        </small>
                                    ) : null;
                                })()}
                                <div className="buttons-holder mt30">
                                    <RSSecondaryButton
                                        className="cancel-btn"
                                        onClick={() => {
                                            // Same as modal X / backdrop: close only. Do not clear parent gallery
                                            // (`onCommittedImages`) or wipe committed RHF fields — reopen syncs from `initialGallery`.
                                            handleClose(false);
                                        }}
                                    >
                                        Cancel
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        disabledClass={`${isUploadDisabled() ? 'pe-none click-off' : ''}`}
                                        onClick={async () => {
                                            if (isMulti) {
                                                clearErrors(uploadImageName);
                                                setMultiCommitError('');
                                                if (isUploadingNow) {
                                                    setMultiCommitError('Please wait for upload to finish');
                                                    return;
                                                }
                                                if (
                                                    socialPostType?.id === 'pinterest_carousel_pin' &&
                                                    selectedMedia.length < 2
                                                ) {
                                                    const msg =
                                                        'Pinterest carousel pins need at least 2 images (max 5). Add another image before uploading.';
                                                    setMultiCommitError(msg);
                                                    return;
                                                }

                                                // Browse/drag already did validation + API upload.
                                                const imgs = selectedMedia
                                                    .map((item) => {
                                                        const url = item?.kind === 'url' ? item.url : '';
                                                        if (!url) return null;
                                                        const mk =
                                                            item.mediaKind === 'video' || item.mediaKind === 'image'
                                                                ? item.mediaKind
                                                                : isVideoLikeRemoteOrDataUrl(url)
                                                                    ? 'video'
                                                                    : 'image';
                                                        return {
                                                            name: truncateTitle(url, 80),
                                                            src: url,
                                                            mediaKind: mk,
                                                        };
                                                    })
                                                    .filter(Boolean);

                                                setValue(uploadImageName, imgs[0]?.src || '');
                                                setValue(previewImageName, imgs[0]?.src || '');
                                                setValue('previewName', imgs.map((i) => i.name).join(', '));
                                                setValue(inputUrlName, '');
                                                onCommittedImages?.(imgs);
                                                InsertImage(true);
                                                setSelectedMedia([]);
                                                setStagedValidationErrors([]);
                                                setMultiCommitError('');
                                                setValue(multiUrlFieldName, '');
                                                resetFileInput();
                                                handleClose();
                                                return;
                                                const needMsg =
                                                    socialMultiUploadAllowsVideoSlides(socialPostType)
                                                        ? 'Add at least one photo or video (upload or URL)'
                                                        : socialPostType?.id === 'pinterest_carousel_pin'
                                                            ? 'Add 2–5 images (2:3 ratio, JPG/PNG) via upload or URL'
                                                            : 'Add at least one image (upload, or URL)';
                                                // setMultiCommitError(needMsg);
                                                if (!Object?.keys(formState?.dirtyFields)?.length) {
                                                    setError(uploadImageName, {
                                                        type: 'custom',
                                                        message: needMsg,
                                                    });
                                                    return;
                                                }
                                            }

                                            if (isUploaded) {
                                                setValue(inputUrlName, '');
                                                handleClose();
                                                handleSave();
                                                InsertImage(true);
                                                return;
                                            }

                                            const value = getValues(inputUrlName);
                                            if (!selectedFiles.length && !value?.length) {
                                                trigger(inputUrlName);
                                                return;
                                            }

                                            if (selectedFiles.length && isUploaded) {
                                                setValue(inputUrlName, '');
                                                handleClose();
                                                handleSave();
                                                InsertImage(true);
                                            } else if (value?.length) {
                                                const isValid = await trigger(inputUrlName);
                                                if (isValid) {
                                                    setValue(previewImageName, value);
                                                    handleSave();
                                                    InsertImage(true);
                                                    handleClose();
                                                }
                                            }
                                        }}
                                    >
                                        Upload
                                    </RSPrimaryButton>
                                </div>
                            </Fragment>
                        ) : type === 'browse' ? (
                            <RSFileUpload
                                isbase64
                                control={control}
                                name={previewImageName}
                                accept={getCommunicationMultiUploadAcceptAttribute(platformType, socialPostType)}
                                customBottomText
                                isPrefix
                                fileCol={9}
                                containerClass={'pt5'}
                                text={'Browse'}
                                clearErrors={clearErrors}
                                rules={{
                                    required: ENTER_IMAGE_URL,
                                }}
                                setError={setError}
                                handleChange={(e) => {
                                    setValue('previewName', e.target.files[0].name);
                                    InsertImage(true);
                                    handleClose();
                                }}
                            />
                        ) : (
                            <Fragment>
                                <Row>
                                    <Col md={9} className="pt9">
                                        <div className="mt5">
                                            <RSInput
                                                control={control}
                                                name={previewImageName}
                                                placeholder={MEDIA_URL}
                                                required
                                                handleOnchange={() => {
                                                    clearErrors(previewImageName);
                                                }}
                                                handleOnBlur={(e) => {
                                                    if (!!e.target.value) {
                                                        trigger(previewImageName);
                                                    }
                                                }}
                                                handleOnPaste={(e) => {
                                                    e.preventDefault();
                                                    const pastedData = e.clipboardData.getData('text');
                                                    if (!!pastedData) {
                                                        setValue(previewImageName, pastedData);
                                                        setTimeout(async () => {
                                                            await trigger(previewImageName);
                                                        }, 100);
                                                    }
                                                }}
                                                rules={{
                                                    required: ENTER_IMAGE_URL,
                                                    validate: (url) => {
                                                        return validateUrlAsImage(url).then((isValid) => {
                                                            if (isValid) {
                                                                return true;
                                                            } else {
                                                                return 'Enter valid image URL';
                                                            }
                                                        });
                                                    },
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={3} className="pl0">
                                        <RSPrimaryButton
                                            onClick={() => {
                                                const { invalid } = getFieldState(previewImageName);
                                                const value = getValues(previewImageName);
                                                if (!invalid && !!value.length) {
                                                    InsertImage(true);
                                                    handleClose();
                                                } else {
                                                    trigger(previewImageName);
                                                }
                                            }}
                                            disabledClass={` ${Object.keys(formState?.errors || {}).length && !selectedMedia?.length ? 'pe-none click-off' : ''} ${isUploaded ? '' : isImageRemove ? '' : 'pe-none click-off'}`}
                                        >
                                            Upload
                                        </RSPrimaryButton>
                                    </Col>
                                </Row>
                                <Row className="lh-base">
                                    <Col md={8}>
                                        <small>
                                            {`${ALLOWED_FORMATS} ${getMultiUploadSupportedFormatsExtensionText(platformType, socialPostType)}`}
                                        </small>
                                    </Col>
                                </Row>
                            </Fragment>
                        )}
                    </div>
                }
            />
        </Fragment>
    );
};

export default MultiImageUpload;