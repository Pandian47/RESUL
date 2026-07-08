import { campaignSchedule, checkTrigger, statusIdCheck } from 'Utils/modules/campaignUtils';
import { convertUserTimezoneToTarget, getYYMMDD } from 'Utils/modules/dateTime';
import { checkScheduleDate } from 'Utils/modules/display';
import { getmasterData } from 'Utils/modules/masterData';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { numberWithCommas } from 'Utils/modules/formatters';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { buildGalleryImagesFromUrls, buildPayloadForSaveData, getFromTab, getMaxImagesForSocialPostType, getSocialPostImageUploadVariant, getVisiblePostTypeOptions, inferPayloadMediaIsVideo, INITIAL_FORM_STATE, INITIAL_WATCH_STATE, isMultiSlideSocialPostTypeId, isPdfSocialPostTypeId, isPostTypeOptionSelectable, isSingleImageSocialPostTypeId, isSocialPostCaptionEditorDisabled, isVideoSocialPostTypeId, matchPostTypeOptionForEdit, parseSocialPostPageImageUrls, shouldAutoOpenSocialPostMediaUploadOnPostTypeSelect, SOCIAL_POST_MEDIA_RESET_FIELDS } from './constant';
import { MAX_LENGTH200, MAXL_LENGTH2000, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_EDITOR_TEXT, ENTER_SOCIAL_POST, ENTER_URL, MINLENGTH, SELECT_AGE_FROM, SELECT_AGE_TO, SELECT_AUDIENCE_LIST, SELECT_COUNTRY, SELECT_POST_ON } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_POST, AGE, ARE_YOU_SURE_WANT_TO_RESET, BOOST_POST, CANCEL, CHECK_START_DATE_AND_END_DATE, CITY, COMMUNICATION_SCHEDULED, CONFIRM, COUNTRY, ENTER_YOUR_POST_TEXT, GENDER, IGNORE_CHANNEL, NEXT, OK, POST_LINK, POST_NAME, POST_ON, PREVIEW, RESET, SAVE, TARGET, TRENDING_TOPICS } from 'Constants/GlobalConstant/Placeholders';
import { builder_upload_medium, circle_info_medium, circle_plus_fill_medium, circle_question_mark_mini, communication_target_medium, editor_smart_link_medium, eye_medium, pencil_edit_medium, refresh_large, smart_link_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { get as _get, cloneDeep as _cloneDeep, isEmpty as _isEmpty, find as _find } from 'Utils/modules/lodashReplacements';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import {
    getTextLimit,
    getImageSpecs,
    getVideoSpecs,
    getDocumentSpecs,
    isVideoSupported,
    isVideoUrlByExtension,
    isMediaRequired,
    validateImageAspectRatio,
    validateImageFileSize,
    validateImageFormat,
    validateVideoFileSize,
    validateVideoFormat,
    validateSocialPostVideoMetadata,
    getPlatformDisplayName,
    probeVideoForSocialValidation,
} from './socialMediaConfig';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import Scheduler from '../../Component/Scheduler';
import BoostPost from './Component/BoostPost/BoostPost';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import RSConfirmationModal from 'Components/ConfirmationModal';
import EmojiPicker from 'Components/EmojiPicker';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    resetCreateCommunication,
    updateDirtyState,
    updateSocialPost,
    updateSocialMediaSetUp,
    updateTab,
    updateVerticalTab,
} from 'Reducers/communication/createCommunication/Create/reducer';
import { availableTabs, communicationChannels, getPreCampaignStatus, mergeChannelAudiences, getPastPlanDurationBlockedState, validatePastPlanDurationOnSubmit, PAST_PLAN_DURATION_CLICK_OFF_CLASS, shouldPromptSkipChannelConfirmation } from '../../constant';
import {
    getDatafromSocialPost,
    getFacebookCountries,
    getSocialMedia,
    imageUplodaSocilaPost,
    saveSocialPost,
    uploadMessagingImage,
    uploadSocialPostDocuments,
} from 'Reducers/communication/createCommunication/Create/request';

import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { MAX_SMART_LINKS, SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID } from 'Constants/GlobalConstant/InputLimit';
import ImageUpload from '../../Component/ImageUpload/ImageUpload';
import MultiImageUpload from '../../Component/ImageUpload/MultiImageUpload';
import Preview from 'Components/Previews/SocialPostMediaPreview';
import PreviewModal from './Component/PreviewImg/Modal';
import PostTypeVisualSelect from './Component/PostTypeVisualSelect';
import CarouselMultiImageSpecModal from './Component/CarouselMultiImageSpecModal';
import { getGeneratedLink, getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import SmartLinkEnable from '../../Component/SmartLinkEnable/SmartLinkEnable';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_EDIT_API_LOADER_CONFIG,
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';

import RSSocialPostPreview from 'Components/Previews/RSSocialPostPreview';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { updateSaveChannelsId, updateChannelAudiences } from 'Reducers/communication/createCommunication/plan/reducer';
const dataURLToBlob = (dataUrl) => {
    const parts = String(dataUrl).split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(parts[1]);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
        buffer[i] = binary.charCodeAt(i);
    }
    return new Blob([buffer], { type: mime });
};

const getGalleryImageLabel = (img, idx) => {
    const n = img?.name && String(img.name).trim();
    return n || `Image ${idx + 1}`;
};

/** Match multi-image rules: MIME or extension (some browsers leave `type` empty for .mov). */
const isGalleryLocalFileVideoLike = (file) =>
    Boolean(
        file &&
        ((file.type && String(file.type).startsWith('video/')) ||
            /\.(mp4|mov|m4v|webm|wmv)(\?|#|$)/i.test(String(file.name || ''))),
        ((file.type && String(file.type).startsWith('video/')) ||
            /\.(mp4|mov|m4v|webm|wmv)(\?|#|$)/i.test(String(file.name || ''))),
    );

const inferMediaKindFromDataUrl = (src, explicitKind = null) => {
    if (explicitKind === 'video' || explicitKind === 'image') return explicitKind;
    const head = String(src || '').slice(0, 140).toLowerCase();
    if (head.startsWith('data:video/')) return 'video';
    return 'image';
};

const validateGalleryFileMedia = (file, displayName, platformType, socialPostType = null, mediaKind = null) =>
    new Promise((resolve) => {
        const looksVideo = isGalleryLocalFileVideoLike(file);
        const kind =
            mediaKind === 'video' || mediaKind === 'image'
                ? mediaKind === 'image' && looksVideo
                    ? 'video'
                    : mediaKind
                : looksVideo
                    ? 'video'
                    : 'image';

        if (!file) {
            resolve({ ok: false, error: `${displayName}: Missing file` });
            return;
        }

        if (kind === 'video') {
            const formatValidation = validateVideoFormat(displayName, platformType, socialPostType);
            if (!formatValidation.isValid) {
                resolve({ ok: false, error: `${displayName}: ${formatValidation.message}` });
                return;
            }
            const sizeValidation = validateVideoFileSize(file.size, platformType, socialPostType);
            if (!sizeValidation.isValid) {
                resolve({ ok: false, error: `${displayName}: ${sizeValidation.message}` });
                return;
            }
            const objUrl = URL.createObjectURL(file);
            probeVideoForSocialValidation(objUrl, { revokeIfBlobUrl: true }).then((dims) => {
                if (!dims) {
                    resolve({ ok: false, error: `${displayName}: Failed to load video for validation` });
                    return;
                }
                const meta = validateSocialPostVideoMetadata(dims.w, dims.h, dims.d, platformType, socialPostType);
                if (!meta.isValid) {
                    resolve({ ok: false, error: `${displayName}: ${meta.message}` });
                    return;
                }
                resolve({ ok: true, blob: file, fileName: displayName, mediaKind: 'video' });
            });
            return;
        }

        const formatValidation = validateImageFormat(displayName, platformType, socialPostType);
        if (!formatValidation.isValid) {
            resolve({ ok: false, error: `${displayName}: ${formatValidation.message}` });
            return;
        }
        const sizeValidation = validateImageFileSize(file.size, platformType, socialPostType);
        if (!sizeValidation.isValid) {
            resolve({ ok: false, error: `${displayName}: ${sizeValidation.message}` });
            return;
        }
        const objUrl = URL.createObjectURL(file);
        const imgEl = new Image();
        imgEl.onload = () => {
            URL.revokeObjectURL(objUrl);
            const aspectValidation = validateImageAspectRatio(imgEl.width, imgEl.height, platformType, socialPostType);
            if (!aspectValidation.isValid) {
                resolve({ ok: false, error: `${displayName}: ${aspectValidation.message}` });
                return;
            }
            resolve({ ok: true, blob: file, fileName: displayName, mediaKind: 'image' });
        };
        imgEl.onerror = () => {
            URL.revokeObjectURL(objUrl);
            resolve({ ok: false, error: `${displayName}: Failed to load image for validation` });
        };
        imgEl.src = objUrl;
    });

/** Validate one local (data URL) gallery media item; error text always starts with the file label. */
const validateGalleryDataMedia = (src, displayName, platformType, socialPostType = null, mediaKind = null) =>
    new Promise((resolve) => {
        const kind = inferMediaKindFromDataUrl(src, mediaKind);
        const blob = dataURLToBlob(src);
        if (!blob) {
            resolve({ ok: false, error: `${displayName}: Could not read ${kind} data` });
            return;
        }

        if (kind === 'video') {
            const formatValidation = validateVideoFormat(displayName, platformType, socialPostType);
            if (!formatValidation.isValid) {
                resolve({ ok: false, error: `${displayName}: ${formatValidation.message}` });
                return;
            }
            const sizeValidation = validateVideoFileSize(blob.size, platformType, socialPostType);
            if (!sizeValidation.isValid) {
                resolve({ ok: false, error: `${displayName}: ${sizeValidation.message}` });
                return;
            }

            const objUrl = URL.createObjectURL(blob);
            probeVideoForSocialValidation(objUrl, { revokeIfBlobUrl: true }).then((dims) => {
                if (!dims) {
                    resolve({ ok: false, error: `${displayName}: Failed to load video for validation` });
                    return;
                }
                const meta = validateSocialPostVideoMetadata(dims.w, dims.h, dims.d, platformType, socialPostType);
                if (!meta.isValid) {
                    resolve({ ok: false, error: `${displayName}: ${meta.message}` });
                    return;
                }
                resolve({ ok: true, blob, fileName: displayName, mediaKind: 'video' });
            });
            return;
        }

        const formatValidation = validateImageFormat(displayName, platformType, socialPostType);
        if (!formatValidation.isValid) {
            resolve({ ok: false, error: `${displayName}: ${formatValidation.message}` });
            return;
        }
        const sizeValidation = validateImageFileSize(blob.size, platformType, socialPostType);
        if (!sizeValidation.isValid) {
            resolve({ ok: false, error: `${displayName}: ${sizeValidation.message}` });
            return;
        }
        const imgEl = new Image();
        imgEl.onload = () => {
            const aspectValidation = validateImageAspectRatio(imgEl.width, imgEl.height, platformType, socialPostType);
            if (!aspectValidation.isValid) {
                resolve({ ok: false, error: `${displayName}: ${aspectValidation.message}` });
                return;
            }
            resolve({ ok: true, blob, fileName: displayName, mediaKind: 'image' });
        };
        imgEl.onerror = () => {
            resolve({ ok: false, error: `${displayName}: Failed to load image for validation` });
        };
        imgEl.src = src;
    });

const SocialPost = ({ type, subChannelId }) => {
    const channelId = 7;
    const navigate = useNavigate();
    const locationRouter = useLocation();
    const domainSegment = (locationRouter.pathname.split('/')[1] || '').toLowerCase();
    const dispatch = useDispatch();
    const locationAds = useQueryParams('/communication');
    const location = locationAds;
    const { timeZoneList } = getmasterData();
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { timeZoneId } = getUserDetails();
    const timeZone = _find(timeZoneList, ['timeZoneID', timeZoneId]);
    const { savedChannelsId, channelAudiences = {} } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { showEditSkeleton, isSavedChannel, beginEditSkeleton, finishEditSkeleton } = useAuthoringChannelEditLoader({
        channelId,
        subChannelId,
    });
    const { runSave, beginSubmit, endSubmit, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } =
        useAuthoringChannelSaveLoader();
    const campaignId = _get(locationAds, 'campaignId', 0);
    const campaignType = _get(locationAds, 'campaignType', 'S');
    const [socialEditData, setSocialEditData] = useState({});

    const {
        tabsState: { socialPost: socialPostTabState },
        activeTabs,
        verticalTab: { type: channelType, currentTab },
        isDirty,
        socialMediaPost: { socialMediaDropDown, fbCountries, fetchSocilaData },
        audience,
        personalization,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { tabSmartLink_Flag, customFields, mobileApps, screenList, subScreenList } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const utcTimeData = useSelector(getUtcTimeData);
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [showConfirmationStatus, setShowConfirmationStatus] = useState(false);
    const methods = useForm(INITIAL_FORM_STATE);

    const {
        control,
        setValue,
        watch,
        setError,
        reset,
        getFieldState,
        getValues,
        formState: { defaultValues, errors, dirtyFields, isValid, isDirty: formDirty },
        clearErrors,
        handleSubmit,
        unregister,
        resetField,
        setFocus,
    } = methods;
    const [renderScheduler, setRenderScheduler] = useState(true);
    const scheduleTimezone = watch('timezone');
    const isPastPlanDurationBlocked = useMemo(() => {
        if (location?.campaignType === 'T') return false;
        return getPastPlanDurationBlockedState({
            location,
            timezone: scheduleTimezone,
            currentUtcTime: utcTimeData?.utcTime,
        });
    }, [
        location?.campaignType,
        location?.startDate,
        location?.endDate,
        scheduleTimezone?.gmtOffset,
        utcTimeData?.utcTime,
    ]);

    const inputRef = useRef();
    const formTypeRef = useRef(null);
    const [targetPopover, setTargetPopover] = useState(false);
    const [isRefresh, setRefresh] = useState(false);

    const [previewFlag, setPreviewFlage] = useState(false);
    const [imagePreviewStatus, setImagePreviewStatus] = useState(false);
    const [mediaStatus, setMediaStatus] = useState(false);
    const [audienceList, setAudienceList] = useState({
        postFirstItem: [],
        postSecondItem: [],
    });
    const [isSmartLink, setIsSmartLink] = useState(false);
    const [mediaType, setMediaType] = useState('Image');
    const [isBoostPostSaved, setBoostPostSaved] = useState(false);
    const [boostPostAry, setBoostPostAry] = useState([]);
    const smartLinks = useSelector((state) => getSmartLinksListWithLabels(state));
    const handleOpenWithAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (smartLinks.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };
    const [isBoostError, setIsBoostError] = useState(null);
    const [isSPFail, setIsSPFail] = useState(false);
    const postOnLoader = useApiLoader();
    const smartLinkInsertLoader = useApiLoader();
    const [validateURL, setValidateURL] = useState(false);
    const [tooltip, setTooltip] = useState({
        video: false,
        image: false,
    });
    const [carouselSpecModalOpen, setCarouselSpecModalOpen] = useState(false);
    const [socialPostGalleryImages, setSocialPostGalleryImages] = useState([]);
    const [postTypeMediaSwitchConfirm, setPostTypeMediaSwitchConfirm] = useState(false);
    const [pendingPostTypeOption, setPendingPostTypeOption] = useState(null);
    /** True after the user picks a post-type card (not on initial load / channel change). */
    const [hasUserSelectedPostType, setHasUserSelectedPostType] = useState(false);
    /** Bumped on post-type reset to remount upload widgets and drop stale file state. */
    const [postTypeMediaResetKey, setPostTypeMediaResetKey] = useState(0);
    /** Single-image post types: open upload modal from post-type card (no toolbar image icon). */
    const [socialPostAutoOpenSingleUpload, setSocialPostAutoOpenSingleUpload] = useState(false);
    /** Multi-slide post types: bump to open upload modal when user selects card. */
    const [socialPostAutoOpenMultiUploadKey, setSocialPostAutoOpenMultiUploadKey] = useState(0);
    const handleMultiUploadAutoOpenConsumed = useCallback(() => {
        setSocialPostAutoOpenMultiUploadKey(0);
    }, []);
    /** Video post types: open video upload modal from post-type card. */
    const [socialPostAutoOpenVideoUpload, setSocialPostAutoOpenVideoUpload] = useState(false);
    /** Document post types: open pdf upload modal from post-type card. */
    const [socialPostAutoOpenPdfUpload, setSocialPostAutoOpenPdfUpload] = useState(false);

    const [
        isBoostPost,
        postOnAudience,
        postOnList,
        isBoostpostSaved,
        trendingTopics = [],
        previewImage,
        editorText,
        previewName,
        approvalList,
        uploadImageName,
        postType,
        schedule,
        browserImage,
        uploadImage,
    ] = watch([...INITIAL_WATCH_STATE, 'browserImage', 'uploadImage']);

    const postTypeOptions = useMemo(() => getVisiblePostTypeOptions(type), [type]);

    const hasUploadedSocialMedia = useCallback(() => {
        if (socialPostGalleryImages?.length > 0) {
            return true;
        }
        const b = String(getValues('browserImage') || '').trim();
        const p = String(getValues('previewImage') || '').trim();
        const u = String(getValues('uploadImage') || '').trim();
        return Boolean(b || p || u);
    }, [getValues, socialPostGalleryImages]);

    const clearUploadedSocialMedia = useCallback(() => {
        SOCIAL_POST_MEDIA_RESET_FIELDS.forEach((field) => {
            resetField(field, { defaultValue: '' });
            setValue(field, '', { shouldDirty: true, shouldValidate: false });
        });
        setSocialPostGalleryImages([]);
        setMediaType('Image');
        setImagePreviewStatus(false);
        setPreviewFlage(false);
        setTooltip({ video: false, image: false });
        clearErrors(SOCIAL_POST_MEDIA_RESET_FIELDS);
    }, [resetField, setValue, clearErrors]);

    const handlePostTypeReset = useCallback(() => {
        clearUploadedSocialMedia();
        resetField('postType', { defaultValue: null });
        setValue('postType', null, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
        setHasUserSelectedPostType(false);
        setSocialPostAutoOpenSingleUpload(false);
        setSocialPostAutoOpenVideoUpload(false);
        setSocialPostAutoOpenPdfUpload(false);
        setSocialPostAutoOpenMultiUploadKey(0);
        setPostTypeMediaResetKey((key) => key + 1);
        clearErrors('postType');
    }, [clearUploadedSocialMedia, resetField, setValue, clearErrors]);

    const handlePostTypeCardSelect = useCallback(
        (opt) => {
            if (!opt || !isPostTypeOptionSelectable(opt)) {
                return;
            }
            // Allow re-clicking the currently selected post type to reopen upload popup,
            // since the toolbar media section is hidden for this flow.
            if (postType?.id === opt.id) {
                if (shouldAutoOpenSocialPostMediaUploadOnPostTypeSelect(opt.id)) {
                    if (isSingleImageSocialPostTypeId(opt.id)) {
                        setSocialPostAutoOpenSingleUpload(true);
                    } else if (isMultiSlideSocialPostTypeId(opt.id)) {
                        setSocialPostAutoOpenMultiUploadKey((n) => n + 1);
                    } else if (isVideoSocialPostTypeId(opt.id)) {
                        setSocialPostAutoOpenVideoUpload(true);
                    } else if (isPdfSocialPostTypeId(opt.id)) {
                        setSocialPostAutoOpenPdfUpload(true);
                    }
                }
                return;
            }
            if (hasUserSelectedPostType && postType?.id && postType.id !== opt.id) {
                return;
            }
            if (hasUploadedSocialMedia()) {
                setPendingPostTypeOption(opt);
                setPostTypeMediaSwitchConfirm(true);
                return;
            }
            setValue('postType', opt, { shouldDirty: true, shouldTouch: true });
            setHasUserSelectedPostType(true);
            if (shouldAutoOpenSocialPostMediaUploadOnPostTypeSelect(opt.id)) {
                if (isSingleImageSocialPostTypeId(opt.id)) {
                    setSocialPostAutoOpenSingleUpload(true);
                } else if (isMultiSlideSocialPostTypeId(opt.id)) {
                    setSocialPostAutoOpenMultiUploadKey((n) => n + 1);
                } else if (isVideoSocialPostTypeId(opt.id)) {
                    setSocialPostAutoOpenVideoUpload(true);
                } else if (isPdfSocialPostTypeId(opt.id)) {
                    setSocialPostAutoOpenPdfUpload(true);
                }
            }
        },
        [postType?.id, hasUserSelectedPostType, hasUploadedSocialMedia, setValue],
    );

    useEffect(() => {
        if (!isSingleImageSocialPostTypeId(postType?.id)) {
            setSocialPostAutoOpenSingleUpload(false);
        }
        if (!isVideoSocialPostTypeId(postType?.id)) {
            setSocialPostAutoOpenVideoUpload(false);
        }
        if (!isPdfSocialPostTypeId(postType?.id)) {
            setSocialPostAutoOpenPdfUpload(false);
        }
    }, [postType?.id]);

    const imageUploadMax = useMemo(
        () => getMaxImagesForSocialPostType(postType),
        [postType],
    );

    const imageUploadVariant = useMemo(
        () => getSocialPostImageUploadVariant(postType),
        [postType],
    );

    const imageUploadResetKey = useMemo(
        () =>
            `${channelType ?? ''}-${currentTab ?? ''}-${socialPostTabState?.currentIndex ?? ''}-${socialPostTabState?.tabName ?? ''}-${type ?? ''}-${postType?.id ?? 'none'}-${postTypeMediaResetKey}`,
        [
            channelType,
            currentTab,
            socialPostTabState?.currentIndex,
            socialPostTabState?.tabName,
            type,
            postType?.id,
            postTypeMediaResetKey,
        ],
    );

    const canOpenSocialPostMediaUploadFromToolbar = useMemo(() => {
        const id = postType?.id;
        if (!id || !shouldAutoOpenSocialPostMediaUploadOnPostTypeSelect(id)) {
            return false;
        }
        if (imageUploadMax > 1) {
            return true;
        }
        if ((imageUploadVariant === 'image' || imageUploadVariant === 'article') && imageUploadMax <= 1) {
            return true;
        }
        if (imageUploadVariant === 'story') {
            return true;
        }
        if (imageUploadVariant === 'video' && isVideoSupported(type, postType)) {
            return true;
        }
        if (imageUploadVariant === 'pdf') {
            return true;
        }
        return false;
    }, [postType?.id, imageUploadMax, imageUploadVariant, type, postType]);

    const openSocialPostMediaUploadFromToolbar = useCallback(() => {
        if (!canOpenSocialPostMediaUploadFromToolbar) {
            return;
        }
        if (imageUploadMax > 1) {
            setSocialPostAutoOpenMultiUploadKey((n) => n + 1);
            return;
        }
        if ((imageUploadVariant === 'image' || imageUploadVariant === 'article') && imageUploadMax <= 1) {
            setSocialPostAutoOpenSingleUpload(true);
            return;
        }
        if (imageUploadVariant === 'story') {
            setSocialPostAutoOpenVideoUpload(true);
            return;
        }
        if (imageUploadVariant === 'video' && isVideoSupported(type, postType)) {
            setSocialPostAutoOpenVideoUpload(true);
            return;
        }
        if (imageUploadVariant === 'pdf') {
            setSocialPostAutoOpenPdfUpload(true);
        }
    }, [
        canOpenSocialPostMediaUploadFromToolbar,
        imageUploadMax,
        imageUploadVariant,
        type,
        postType,
    ]);

    const fetchedSocialPostStatusId = useMemo(() => {
        const list = fetchSocilaData?.socialMediaPostList;
        if (!fetchSocilaData || !list || typeof list !== 'object') {
            return null;
        }
        if (!Object.keys(fetchSocilaData).length || !Object.keys(list).length) {
            return null;
        }
        const recordChannelId = list.socialMediaChannelId;
        const activeChannelId = getFromTab(type);
        if (recordChannelId != null && recordChannelId !== '') {
            if (Number(recordChannelId) !== Number(activeChannelId)) {
                return null;
            }
        }
        return list.statusId;
    }, [fetchSocilaData, type]);

    const previewProps = {
        previewImage,
        editorText,
        mediaType,
        uploadImage: uploadImageName,
        mode: locationAds?.isEditable,
    };
    const dirty = { ...dirtyFields };
    const boostPost = getValues('boostPost');
    const trendingTopicsErrorMessage = _get(errors, 'trendingTopics.message', null);
    // console.log(editorText?.length, 'editorText');

    // useEffect(() => {
    //     const user = {
    //         clientId,
    //         userId,
    //     };
    //     if (_get(locationAds, 'campaignType', '') === 'S') {
    //         dispatch(
    //             getAudienceList({
    //                 payload: {
    //                     ...user,
    //                     campaignId: campaignId,
    //                     departmentId,
    //                     searchText: '',
    //                     segmentIds: [],
    //                     channelType: 'E',
    //                 },
    //             }),
    //         );
    //     }
    // }, [locationAds]);

    useEffect(() => {
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId };
            const res = await dispatch(
                getSmartUrl({
                    payload,
                    listData: { mobileApps, personalization },
                    screenListObj: { screenList, subScreenList },
                    reduceLoad: true,
                }),
            );
            if (!res?.status) {
                setIsSmartLink(true);
                dispatch(updateSmartLinkShow(false));
            } else {
                setIsSmartLink(false);
                dispatch(updateSmartLinkShow(true));
            }
        }
        if (!smartLink1 && !tabSmartLink_Flag) {
            if (locationAds && campaignId > 0) {
                if (!statusIdCheck(fetchedSocialPostStatusId, location?.campaignType, undefined)) {
                    //getSmartLink();
                } else {
                    setIsSmartLink(false);
                    dispatch(updateSmartLinkShow(true));
                    dispatch(showTabsSmartlink(false));
                }
            }
        }
    }, [locationAds, fetchSocilaData, fetchedSocialPostStatusId]);

    useEffect(() => {
        const getCountriesList = () => {
            let payload = {
                departmentId: 1,
            };
            dispatch(getFacebookCountries({ payload, loading: false }));
        };
        if (subChannelId === 1) {
            getCountriesList();
        }
    }, [subChannelId]);

    useEffect(() => {
        const data = {
            ..._cloneDeep(INITIAL_FORM_STATE.defaultValues),
            timezone: timeZone || '',
        };
        reset(data);
        setValue('postType', null);
        setHasUserSelectedPostType(false);
        setSocialPostGalleryImages([]);
        setSocialPostAutoOpenMultiUploadKey(0);
        setPostTypeMediaResetKey((key) => key + 1);
        setImagePreviewStatus(false);
        setPreviewFlage(false);
        setMediaType('Image');
        setRenderScheduler(false);
        const timer = setTimeout(() => {
            setRenderScheduler(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [type]);

    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [dirty]);

    useEffect(() => {
        if (campaignId !== 0) {
            handlePostDropDown();
        }
    }, [locationAds, subChannelId, type]);

    useEffect(() => {
        if (!!socialEditData?.socialMediaPostList) {
            const { targetGender, isBoostPostEnabled, targetAgeFrom, targetAgeTo, targetRegion } =
                socialEditData?.socialMediaPostList;
            const countryData = fbCountries?.find((item) => item?.fBCountryCode === targetRegion.toUpperCase());
            setBoostPostAry([countryData, targetAgeFrom, targetAgeTo, targetGender]);
            setBoostPostSaved(isBoostPostEnabled ? true : false);
        }
    }, [socialEditData, fbCountries]);

    const handlePostDropDown = async () => {
        let payload = { userId, clientId, departmentId, socialMediaChannelId: getFromTab(type) };
        const savedChannel = savedChannelsId[7]?.includes(subChannelId) ? true : false;
        if (savedChannel) {
            beginEditSkeleton();
        }
        try {
            const { status, data } =
                (await postOnLoader.refetch({
                    fetcher: ({ payload: socialPayload } = {}) =>
                        dispatch(getSocialMedia({ payload: socialPayload, loading: false })),
                    mode: savedChannel ? 'edit' : 'create',
                    loaderConfig: savedChannel ? AUTHORING_EDIT_API_LOADER_CONFIG : AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload },
                })) || {};
            if (status && savedChannel) {
                await handleGetDataSocialPost(data);
            } else {
                dispatch(updateSocialMediaSetUp({ data: {}, field: 'fetchSocilaData' }));
                const emptyForm = {
                    ..._cloneDeep(INITIAL_FORM_STATE.defaultValues),
                    timezone: timeZone || '',
                };
                reset(emptyForm);

                setSocialEditData({});
            }
        } finally {
            if (savedChannel) {
                finishEditSkeleton();
            }
        }
    };

    /**
     * Get timezone-adjusted start and end dates for schedule validation
     * @param {string} fieldName - Field name for split tabs (e.g., 'split1') or null for regular campaign
     * @param {Object} customTimezone - Custom timezone object with gmtOffset property
     * @returns {Object} - { adjustedStartDate, adjustedEndDate } in YYYY-MM-DD format
     */
    const getTimezoneAdjustedDateRange = (fieldName = null, customTimezone = null) => {
        const formValues = getValues();
        let selectedTimezone;

        if (customTimezone) {
            // Use custom timezone if provided
            selectedTimezone = customTimezone;
        } else if (fieldName) {
            // For split AB tabs, get timezone from the specific field
            selectedTimezone = formValues[fieldName]?.timezone;
        } else {
            // For regular campaign, get timezone from main form
            selectedTimezone = formValues.timezone;
        }

        // If no timezone is selected, use original dates
        if (!selectedTimezone?.gmtOffset) {
            return {
                adjustedStartDate: locationAds?.startDate,
                adjustedEndDate: locationAds?.endDate,
            };
        }

        // Get user profile timezone
        const { timeZoneId } = getUserDetails();
        const { timeZoneList } = getmasterData();
        const profileTimezone = _find(timeZoneList, ['timeZoneID', timeZoneId]);

        // If no profile timezone found, use original dates
        if (!profileTimezone?.gmtOffset) {
            return {
                adjustedStartDate: locationAds?.startDate,
                adjustedEndDate: locationAds?.endDate,
            };
        }

        // Convert original start and end dates from profile timezone to selected timezone
        const originalStartDate = new Date(locationAds?.startDate);
        const originalEndDate = new Date(locationAds?.endDate);

        const adjustedStartDate = convertUserTimezoneToTarget(
            originalStartDate,
            profileTimezone.gmtOffset,
            selectedTimezone.gmtOffset,
            false,
        );

        const adjustedEndDate = convertUserTimezoneToTarget(
            originalEndDate,
            profileTimezone.gmtOffset,
            selectedTimezone.gmtOffset,
            false,
        );

        return {
            adjustedStartDate: getYYMMDD(adjustedStartDate),
            adjustedEndDate: getYYMMDD(adjustedEndDate),
        };
    };

    const handleGetDataSocialPost = async (listDropdown) => {
        const payload = {
            campaignId: locationAds?.campaignId,
            actionId: 1,
            levelNumber: 1,
            socialMediaPostChannelId: getFromTab(type),
        };
        const { data, status } = await dispatch(getDatafromSocialPost({ payload, loading: false }));
        setTargetPopover(false);
        if (status) {
            const { socialMediaPostList = {}, segmentationListId } = data || {};
            const {
                postName,
                postLink,
                postText,
                targetGender,
                trendingTopic,
                isBoostPostEnabled,
                localBlastDateTime,
                targetAgeFrom,
                targetAgeTo,
                targetRegion,
                pageImage,
                timezoneId,
                isDaylight,
                postImagePath,
                socialMediaSetupId,
                postType: savedListPostType,
            } = socialMediaPostList;
            const audienceData = audience.filter((item) => segmentationListId?.includes(item.segmentationListId));
            const postMediaOnList = listDropdown?.filter((item) => item?.socialMediaSetupId === socialMediaSetupId);
            const tagsTrending = trendingTopic ? trendingTopic.split(',') || [] : [];
            const countryData = fbCountries?.find((item) => item?.fBCountryCode === targetRegion.toUpperCase());
            const timezone = timeZoneList?.find((item) => item?.timeZoneID === timezoneId);
            let imageUrls = parseSocialPostPageImageUrls(pageImage);
            if (imageUrls.length === 0 && postImagePath) {
                imageUrls = parseSocialPostPageImageUrls(postImagePath);
            }
            const galleryForEdit =
                imageUrls.length > 1 ? buildGalleryImagesFromUrls(imageUrls) : [];
            const postImagePathStr = postImagePath != null ? String(postImagePath).trim() : '';
            const postImagePathAsPlainUrl =
                postImagePathStr && !postImagePathStr.startsWith('[') ? postImagePathStr : '';
            const primaryMediaUrl = imageUrls[0] || postImagePathAsPlainUrl || '';
            const previewNameForMedia =
                galleryForEdit.length > 0
                    ? galleryForEdit.map((g) => g.name).join(', ')
                    : primaryMediaUrl
                        ? primaryMediaUrl.split('/').pop()?.split('?')[0] || ''
                        : '';
            const postTypeForEdit = matchPostTypeOptionForEdit(
                type,
                savedListPostType,
                imageUrls.length,
            );

            setSocialEditData(data);

            if (savedListPostType === 'Video' || savedListPostType === 'Reels') {
                setMediaType('Video');
            } else {
                setMediaType('Image');
            }

            setSocialPostGalleryImages(galleryForEdit);
            setHasUserSelectedPostType(!!postTypeForEdit);

            reset((formData) => ({
                ...formData,
                postName: postName,
                postLink: postLink,
                postOnList: postMediaOnList[0],
                postOnAudience: audienceData,
                isBoostPost: isBoostPostEnabled === 0 ? false : true,
                schedule: localBlastDateTime !== '' ? new Date(localBlastDateTime) : '',
                trendingTopics: tagsTrending,
                sendTimeRecommendation: '',
                timezone: timezone,
                daylightSavings: isDaylight === 0 ? false : true,
                boostPost: {
                    country: countryData,
                    city: '',
                    ageFrom: targetAgeFrom,
                    ageTo: targetAgeTo,
                    gender: targetGender,
                    fbCountries: countryData,
                },
                approvalList: {
                    name: [{ approverName: '', mandatory: false }],
                    requestApproval: false,
                    approvalFrom: targetGender,
                    approvalCount: '2',
                    followHierarchy: false,
                },
                editorText: postText,
                previewImage: primaryMediaUrl,
                previewName: previewNameForMedia,
                browserImage: primaryMediaUrl || postImagePathAsPlainUrl,
                postType: postTypeForEdit ?? formData.postType,
                socialMediaPostId: 0,
            }));
        } else {
            setIsSPFail(true);
            dispatch(updateSocialMediaSetUp({ data: {}, field: 'fetchSocilaData' }));
            const data = {
                ..._cloneDeep(INITIAL_FORM_STATE.defaultValues),
                timezone: timeZone || '',
            };
            reset(data);
            setSocialEditData({});
            setSocialPostGalleryImages([]);
            setMediaType('Image');
        }
    };

    const handleSaveChannelsId = async () => {
        const finalSavedChannelId = { ...savedChannelsId };
        if (savedChannelsId[channelId]?.includes(subChannelId)) {
            finalSavedChannelId[channelId] = [...savedChannelsId[channelId]];
        } else {
            finalSavedChannelId[channelId] = [...(savedChannelsId[channelId] || []), subChannelId];
        }
        await dispatch(updateSaveChannelsId(finalSavedChannelId));
    };
    const postSaveSocialPost = async (formData, typeButton) => {
        beginSubmit(getAuthoringSaveButtonType(typeButton === 'save' ? 'save' : 'form'));
        try {
            const utcTimeResponse = await dispatch(getUtcTimeNow(false));
            const currentUtcTimeData = utcTimeResponse || utcTimeData;
            const values = getValues();

            if (
                location?.campaignType !== 'T' &&
                validatePastPlanDurationOnSubmit({
                    location,
                    formState: values,
                    setError,
                    currentUtcTime: currentUtcTimeData?.utcTime,
                })
            ) {
                return;
            }

            let statusId = fetchedSocialPostStatusId;
            if (values?.postOnAudience?.length === 0 && values?.postOnList?.length === 0) {
                setError(`postOnAudience`, {
                    type: 'custom',
                    message: 'Select an audience',
                });
                return;
            }
            if (values?.editorText?.length > getTextLimit(type, values?.postType)) {
                setError(`editorText`, {
                    type: 'custom',
                    message: `Max. ${getTextLimit(type, values?.postType)}`,
                });
                return;
            }
            if (values?.isBoostPost) {
                let ageFrom = values?.boostPost?.ageFrom || 0 === 0;
                if (ageFrom && !boostPostAry[1])
                    setError('boostPost.ageFrom', { type: 'custom', message: SELECT_AGE_FROM });
                let ageTo = values?.boostPost?.ageTo || 0 === 0;
                if (ageTo && !boostPostAry[2])
                    setError('boostPost.ageTo', { type: 'custom', message: SELECT_AGE_TO });
                let country = _isEmpty(values?.boostPost?.country);
                if (country && !boostPostAry[0])
                    setError('boostPost.country', { type: 'custom', message: SELECT_COUNTRY });
                if (boostPostAry?.length === 0 && ageFrom && ageTo && country) {
                    setTargetPopover(true);
                    setFocus('isBoostPost');
                    return;
                }
            }
            let pageImageUrls = [];

            if (socialPostGalleryImages.length > 0) {
                const ordered = new Array(socialPostGalleryImages.length).fill('');
                const dataUrlJobs = [];
                const fileJobs = [];

                socialPostGalleryImages.forEach((img, idx) => {
                    const src = img?.src || '';
                    const label = getGalleryImageLabel(img, idx);
                    const kind = img?.mediaKind || null;
                    if (/^https?:\/\//i.test(src)) {
                        ordered[idx] = src;
                    } else if (src.startsWith('data:')) {
                        dataUrlJobs.push({ idx, src, label, mediaKind: kind });
                    } else if (img?.file) {
                        fileJobs.push({ idx, file: img.file, label, mediaKind: kind });
                    }
                });

                const dataUrlValidationResults = await Promise.all(
                    dataUrlJobs.map(({ idx, src, label, mediaKind }) =>
                        validateGalleryDataMedia(src, label, type, values?.postType, mediaKind).then((r) => ({
                            idx,
                            label,
                            ...r,
                        })),
                    ),
                );
                const fileValidationResults = await Promise.all(
                    fileJobs.map(({ idx, file, label, mediaKind }) =>
                        validateGalleryFileMedia(file, label, type, values?.postType, mediaKind).then((r) => ({
                            idx,
                            label,
                            ...r,
                        })),
                    ),
                );
                const validationResults = [...dataUrlValidationResults, ...fileValidationResults];

                const failedValidation = validationResults.filter((r) => !r.ok);
                if (failedValidation.length > 0) {
                    setError('previewImage', {
                        type: 'custom',
                        message: failedValidation.map((r) => r.error).join(' · '),
                    });
                    return;
                }

                const toUpload = validationResults.filter((r) => r.ok && r.blob);
                const toUploadSorted = [...toUpload].sort((a, b) => a.idx - b.idx);

                const pickRowUrl = (row) =>
                    row?.url || row?.filePath || row?.url || (typeof row === 'string' ? row : '');

                const uploadAllMedia = async (batch, kindLabel) => {
                    if (!batch.length) return { status: true, data: [] };
                    const formData = new FormData();
                    batch.forEach((r) => {
                        formData.append('File', r.blob, r.fileName);
                    });
                    const res = await dispatch(uploadSocialPostDocuments({ payload: formData }));
                    if (!res?.status) {
                        setError('previewImage', {
                            type: 'custom',
                            message: `${res?.message || 'Upload failed'} (${kindLabel}). Files: ${batch
                                .map((r) => r.label)
                                .join(', ')}`,
                        });
                        return null;
                    }
                    const raw = res?.data;
                    const data = Array.isArray(raw)
                        ? raw
                        : raw && typeof raw === 'object'
                            ? [raw]
                            : typeof raw === 'string'
                                ? [{ url: raw }]
                                : [];
                    return { status: true, data };
                };

                const uploadedRes = await uploadAllMedia(toUploadSorted, 'media');
                if (!uploadedRes) return;

                const missingUrls = [];
                toUploadSorted.forEach((r, j) => {
                    const url = pickRowUrl(uploadedRes.data[j]);
                    if (url) {
                        ordered[r.idx] = url;
                    } else {
                        const serverLabel = uploadedRes.data[j]?.originalName || uploadedRes.data[j]?.filename;
                        missingUrls.push(serverLabel || r.label);
                    }
                });

                if (missingUrls.length > 0) {
                    setError('previewImage', {
                        type: 'custom',
                        message: `No URL returned for: ${missingUrls.join(', ')}`,
                    });
                    return;
                }

                if (ordered.some((u) => !u)) {
                    const missingLabels = ordered
                        .map((u, i) =>
                            !u ? getGalleryImageLabel(socialPostGalleryImages[i], i) : null,
                        )
                        .filter(Boolean);
                    setError('previewImage', {
                        type: 'custom',
                        message: `Missing image URL for: ${missingLabels.join(', ')}`,
                    });
                    return;
                }
                pageImageUrls = ordered;
            } else if (previewName && String(previewImage || '').includes('base64')) {
                const res = await dispatch(
                    imageUplodaSocilaPost({ fileName: previewName, fileByte: previewImage?.split(',')[1] }),
                );
                if (res?.status) {
                    const url =
                        typeof res?.data === 'string'
                            ? res?.data
                            : res?.data?.url || res?.data?.filePath || res?.data?.data?.filePath;
                    if (url) {
                        pageImageUrls = [url];
                    }
                }
            } else {
                const single = (values.browserImage || values.previewImage || '').trim();
                if (single) {
                    pageImageUrls = [single];
                }
            }

            if (values?.postType?.id === 'pinterest_carousel_pin') {
                const n = pageImageUrls.length || socialPostGalleryImages.length;
                if (n < 2 || n > 5) {
                    setError('previewImage', {
                        type: 'custom',
                        message: 'Pinterest carousel pins require 2–5 images.',
                    });
                    return;
                }
            }
            if (
                (values?.postType?.id === 'pinterest_single_pin' || values?.postType?.id === 'pinterest_video_pin') &&
                pageImageUrls.length === 0
            ) {
                setError('previewImage', {
                    type: 'custom',
                    message: 'Add media for this Pinterest post type before saving.',
                });
                setMediaStatus(true);
                return;
            }

            if (!values?.schedule && typeButton !== 'confirmationSave') {
                formTypeRef.current = typeButton;
                setShowConfirmationStatus(true);
                return;
            }
            if (isMediaRequired(type) && pageImageUrls.length === 0) {
                setError(`previewImage`, {
                    type: 'custom',
                    message: `${getPlatformDisplayName(type)} requires media content to proceed`,
                });
                setMediaStatus(true);
                return;
            }
            if (isValid || Object.keys(errors)?.length === 0) {
                if (formData?.schedule !== '' && formData?.schedule !== null) {
                    const { adjustedStartDate, adjustedEndDate } = getTimezoneAdjustedDateRange(null, formData?.timezone);
                    const ScheduleStatus = checkScheduleDate(formData?.schedule, adjustedStartDate, adjustedEndDate);
                    if (ScheduleStatus) {
                        setError(`schedule`, {
                            type: 'custom',
                            // message: 'Select a date and time later than ' + scheduleError + '.',
                            message: CHECK_START_DATE_AND_END_DATE,
                        });
                        return;
                    }
                    let scheduleError = campaignSchedule(
                        formData?.schedule,
                        formData?.timezone?.gmtOffset,
                        statusId,
                        currentUtcTimeData?.utcTime,
                    );
                    if (!scheduleError) {
                        const cityTime = convertUserTimezoneToTarget(
                            currentUtcTimeData?.utcTime
                                ? new Date(currentUtcTimeData.utcTime.replace('Z', ''))
                                : new Date(),
                            '(GMT+00:00) ',
                            formData?.timezone?.gmtOffset,
                        );
                        // Add 15 minutes to cityTime
                        const cityTimeWithBuffer = new Date(cityTime);
                        cityTimeWithBuffer.setMinutes(cityTimeWithBuffer.getMinutes() + 15);
                        const formattedCityTime = cityTimeWithBuffer.toLocaleString();
                        setError(`schedule`, {
                            type: 'custom',
                            message: `Select a date & time later than ${formattedCityTime}`,
                        });
                        return;
                    }
                }
                const payload = buildPayloadForSaveData(
                    values,
                    userId,
                    clientId,
                    departmentId,
                    campaignId,
                    type,
                    campaignType,
                    timeZone,
                    boostPostAry,
                    locationAds,
                    {
                        pageImageUrls,
                        mediaIsVideo: inferPayloadMediaIsVideo(pageImageUrls, socialPostGalleryImages),
                    },
                );
                // debugger;
                let res = await runSave(getAuthoringSaveButtonType(typeButton === 'save' ? 'save' : 'form'), () =>
                    dispatch(saveSocialPost(payload, { loading: false })),
                );
                if (res?.status) {
                    await handleSaveChannelsId();
                    const selectedAudience = Array.isArray(audience) ? audience : [];
                    dispatch(updateChannelAudiences(mergeChannelAudiences('SocialPost', selectedAudience, channelAudiences)));
                    const finalTypeButton = typeButton === 'confirmationSave' ? formTypeRef.current : typeButton;
                    if (finalTypeButton === 'save') {
                        navigate('/communication');
                    } else {
                        tabChange();
                    }
                }
            }
        } finally {
            endSubmit();
        }
    };

    const tabChange = () => {
        dispatch(updateSocialPost({ field: type, data: [] }));
        window.scrollTo(0, 0);
        //debugger;
        const data = {
            ..._cloneDeep(INITIAL_FORM_STATE.defaultValues),
            timezone: timeZone || '',
        };
        reset(data);
        const tabIndex = socialPostTabState.currentIndex + 1;
        if (availableTabs['socialPost']?.length === tabIndex) {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'voice',
                            currentTab: 4,
                        },
                    }),
                );
            } else {
                const status = getPreCampaignStatus(savedChannelsId);
                if (status) {
                    navigate('/communication', {
                        index: 0,
                    });
                } else {
                    let url = '/communication/execute';
                    const encryptState = encodeUrl(locationAds);
                    dispatch(resetCreateCommunication());
                    navigate(`${url}?q=${encryptState}`, {
                        state: locationAds,
                    });
                }
            }
        } else {
            dispatch(
                updateTab({
                    field: 'socialPost',
                    data: {
                        tabName: availableTabs['socialPost'][tabIndex],
                        currentIndex: tabIndex,
                    },
                }),
            );
        }
    };

    const handleSelectionChange = (e) => {
        inputRef.current = {
            startPoistion: e.target.selectionStart,
            endPosition: e.target.selectionEnd,
        };
    };

    const handleChannelId = () => {
        switch (type) {
            case 'facebook':
                return 5;
            case 'twitter':
                return 7;
            case 'pinterest':
                return 9;
            case 'instagram':
                return 10;
            case 'linkedIn':
                return 12;
            default:
                return 5;
        }
    };
    const getRemoteSource = () => {
        switch (type) {
            case 'facebook':
                return 24;
            case 'twitter':
                return 26;
            case 'pinterest':
                return 82;
            case 'instagram':
                return 85;
            case 'linkedIn':
                return 83;
            default:
                return 0;
        }
    };
    const handleChange = async (smData, insertType, emoji) => {
        if (insertType === 'dynamic') {
            let goalValue = 0,
                blastValue = 1,
                parentClientValue = 0,
                actionValue = 0;
            goalValue = smData?.goalNo ?? 0;
            if (locationAds?.campaignType === 'S') {
                blastValue = 1;
                parentClientValue = 0;
                actionValue = 0;
            } else if (locationAds?.campaignType === 'T') {
                blastValue = 1;
                parentClientValue = 0;
                actionValue = 0;
            } else {
                blastValue = 0;
                parentClientValue = 0;
                actionValue = 0;
            }
            const channelPayload = {
                campaignId: locationAds?.campaignId,
                blastType: '',
                channelId: handleChannelId(),
                goalNo: goalValue,
                blastNo: blastValue,
                parentChannelDetailId: parentClientValue,
                actionId: actionValue,
                clientId,
                departmentId,
                userId,
                subSegmentId: 0,
            };

            const { status, data } =
                (await smartLinkInsertLoader.refetch({
                    fetcher: ({ payload } = {}) => dispatch(getSmartUrlDetailByChannel({ payload, loading: false })),
                    mode: 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload: channelPayload },
                })) || {};
            if (status) {
                const { urlName, smartCode, blastSC } = data || {};
                const text = editorText || '';
                const smartURL = urlName + smartCode + blastSC;
                const maxLength = getMaxLengthByType();
                let finalValue;

                if (inputRef?.current === undefined) {
                    finalValue = text?.length > 0 ? text + ' ' + smartURL : smartURL;
                } else {
                    const start = text?.slice(0, inputRef?.current?.startPoistion);
                    const end = text?.slice(inputRef?.current?.endPosition);
                    const spaceBefore = start?.length > 0 ? ' ' : '';
                    const spaceAfter = end?.length > 0 ? ' ' : '';
                    finalValue = start + spaceBefore + smartURL + spaceAfter + end;
                }

                if (finalValue?.length <= maxLength) {
                    setValue('editorText', finalValue);
                    if (inputRef?.current !== undefined) {
                        const newCursorPosition = inputRef?.current?.startPoistion + finalValue?.length - text?.length;
                        inputRef.current = {
                            startPoistion: newCursorPosition,
                            endPosition: newCursorPosition,
                        };
                    }
                } else {
                    setError('editorText', {
                        type: 'custom',
                        message: `Max. ${maxLength}`,
                    });
                    return;
                }
            }
        } else {
            const text = editorText || '';
            const maxLength = getMaxLengthByType();
            let finalValue;

            if (inputRef?.current === undefined) {
                finalValue = text?.length > 0 ? text + ' ' + smData : smData;
            } else {
                const start = text?.slice(0, inputRef?.current?.startPoistion);
                const end = text?.slice(inputRef?.current?.endPosition);
                const spaceBefore = start?.length > 0 ? ' ' : '';
                const spaceAfter = end?.length > 0 ? ' ' : '';
                finalValue = start + smData + end;
            }

            if (finalValue?.length <= maxLength) {
                setValue('editorText', finalValue);
                if (inputRef?.current !== undefined) {
                    const newCursorPosition = inputRef?.current?.startPoistion + finalValue?.length - text?.length;
                    inputRef.current = {
                        startPoistion: newCursorPosition,
                        endPosition: newCursorPosition,
                    };
                }
            } else {
                setError('editorText', {
                    type: 'custom',
                    message: `Max. ${maxLength}`,
                });
                return;
            }
        }
    };

    const handleImageData = async (base64Image, fileName, contentLength) => {
        if (fileName !== '' && base64Image !== '') {
            const formatValidation = validateImageFormat(fileName, type, postType);
            if (!formatValidation.isValid) {
                return { status: false, message: formatValidation.message };
            }

            const sizeValidation = validateImageFileSize(contentLength, type, postType);
            if (!sizeValidation.isValid) {
                return { status: false, message: sizeValidation.message };
            }

            return new Promise((resolve) => {
                const img = new Image();
                img.onload = async () => {
                    const aspectValidation = validateImageAspectRatio(img.width, img.height, type, postType);
                    if (!aspectValidation.isValid) {
                        resolve({ status: false, message: aspectValidation.message });
                        return;
                    }

                    let payloadData = {
                        base64Image,
                        imageFormat: fileName.split('.')?.pop(),
                        contentLength,
                        fileName: fileName,
                        clientId,
                        departmentId,
                        userId,
                        channelId: 7
                    };

                    let { data, status, message } = await dispatch(
                        uploadMessagingImage({ payload: payloadData, loading: false }),
                    );

                    if (status) {
                        setSocialPostGalleryImages([]);
                        setMediaType('Image');
                        setValue('browserImage', data);
                        setValue(`previewImage`, data);
                        setValue(`uploadImage`, data);
                        resolve({ status: true, message: message });
                    } else {
                        setValue('browserImage', '');
                        setValue(`previewImage`, '');
                        setValue(`uploadImage`, '');
                        resolve({ status: false, message: message });
                    }
                };
                img.onerror = () => {
                    resolve({ status: false, message: 'Failed to load image for validation' });
                };
                img.src = `data:image/${fileName.split('.')?.pop()};base64,${base64Image.split(',')[1] || base64Image}`;
            });
        }
    };

    const handleVideoData = async (base64Image, fileName, contentLength, sourceFile) => {
        if (fileName !== '' && base64Image !== '') {
            if (!isVideoSupported(type, postType)) {
                return { status: false, message: `Video upload is not supported for ${getPlatformDisplayName(type)}` };
            }

            const formatValidation = validateVideoFormat(fileName, type, postType);
            if (!formatValidation.isValid) {
                return { status: false, message: formatValidation.message };
            }

            const sizeValidation = validateVideoFileSize(contentLength, type, postType);
            if (!sizeValidation.isValid) {
                return { status: false, message: sizeValidation.message };
            }

            const lower = String(fileName).toLowerCase();
            const mime = lower.endsWith('.wmv')
                ? 'video/x-ms-wmv'
                : lower.endsWith('.mov')
                    ? 'video/quicktime'
                    : 'video/mp4';
            const dataUrl = String(base64Image).includes('data:')
                ? base64Image
                : `data:${mime};base64,${String(base64Image).split(',').pop()}`;

            let dims = null;
            if (sourceFile instanceof File) {
                const blobUrl = URL.createObjectURL(sourceFile);
                dims = await probeVideoForSocialValidation(blobUrl, { revokeIfBlobUrl: true });
            }
            if (!dims) {
                dims = await probeVideoForSocialValidation(dataUrl, { revokeIfBlobUrl: false });
            }

            let metaCheck;
            if (dims) {
                metaCheck = validateSocialPostVideoMetadata(dims.w, dims.h, dims.d, type, postType);
            } else {
                metaCheck = {
                    isValid: false,
                    message: `${getPlatformDisplayName(type)} could not read video metadata (try MP4)`,
                };
            }
            if (!metaCheck.isValid) {
                return { status: false, message: metaCheck.message };
            }

            const blob = dataURLToBlob(dataUrl);
            if (!blob) {
                return { status: false, message: 'Could not read video file' };
            }

            const formData = new FormData();
            formData.append('File', blob, fileName);
            const res = await dispatch(uploadSocialPostDocuments({ payload: formData }));
            const rawData = res?.data;
            const uploaded = Array.isArray(rawData) ? rawData : rawData && typeof rawData === 'object' ? [rawData] : [];
            const url =
                uploaded[0]?.url ||
                uploaded[0]?.filePath ||
                (typeof rawData === 'string' && /^https?:\/\//i.test(rawData) ? rawData : '');

            if (res?.status && url) {
                setSocialPostGalleryImages([]);
                setValue('browserImage', url);
                setValue('previewImage', url);
                setValue('uploadImage', url);
                setValue('uploadImageName', fileName);
                setMediaType('Video');
                return { status: true, message: res?.message || 'Video uploaded successfully' };
            }
            return { status: false, message: res?.message || 'Video upload failed' };
        }
    };

    /** Pasted “Video URL” in upload modal: probe duration/dimensions then apply (no re-upload). */
    const applySocialPostVideoUrlFromModal = async (url, options = {}) => {
        const { apply = true } = options;
        const trimmed = String(url || '').trim();
        if (!trimmed) {
            return { status: false, message: 'Enter a video URL' };
        }
        if (!isVideoSupported(type, postType)) {
            return { status: false, message: `Video is not supported for ${getPlatformDisplayName(type)}` };
        }
        const name = trimmed.split('/').pop()?.split('?')[0] || 'video.mp4';
        const formatValidation = validateVideoFormat(name, type, postType);
        if (!formatValidation.isValid) {
            return { status: false, message: formatValidation.message };
        }
        const dims = await probeVideoForSocialValidation(trimmed, { revokeIfBlobUrl: false, maxWaitMs: 25000 });
        if (!dims?.w || !dims?.h) {
            return {
                status: false,
                message: `${getPlatformDisplayName(type)} could not read video from this URL`,
            };
        }
        const meta = validateSocialPostVideoMetadata(dims.w, dims.h, dims.d, type, postType);
        if (!meta.isValid) {
            return { status: false, message: meta.message };
        }
        if (apply) {
            setSocialPostGalleryImages([]);
            setValue('browserImage', trimmed);
            setValue('previewImage', trimmed);
            setValue('uploadImage', trimmed);
            setValue('uploadImageName', name);
            setMediaType('Video');
        }
        return { status: true, message: apply ? 'Video URL applied' : 'Video URL validated' };
    };

    /** Story URL path: enforce video limits for video links; allow image links unchanged. */
    const applySocialPostStoryUrlFromModal = async (url, options = {}) => {
        const trimmed = String(url || '').trim();
        if (!trimmed) {
            return { status: false, message: 'Enter a media URL' };
        }
        if (isVideoUrlByExtension(trimmed, type, postType)) {
            return applySocialPostVideoUrlFromModal(trimmed, options);
        }
        const { apply = true } = options;
        if (apply) {
            setSocialPostGalleryImages([]);
            setValue('browserImage', trimmed);
            setValue('previewImage', trimmed);
            setValue('uploadImage', trimmed);
            setValue('uploadImageName', trimmed.split('/').pop()?.split('?')[0] || 'image');
            setMediaType('Image');
        }
        return { status: true, message: apply ? 'Media URL applied' : 'Media URL validated' };
    };

    /** PDF / document file upload (same modal UX as image + video). */
    const handleDocumentData = async (base64Payload, fileName, contentLength) => {
        if (!fileName || base64Payload === '') {
            return { status: false, message: 'Invalid document' };
        }
        if (!String(fileName).toLowerCase().endsWith('.pdf')) {
            return { status: false, message: 'Only .pdf files are supported' };
        }
        const maxBytes = getDocumentSpecs(type, postType).maxFileSize;
        if (contentLength > maxBytes) {
            return {
                status: false,
                message: `Document size max. ${Math.round(maxBytes / (1024 * 1024))} MB`,
            };
        }
        const dataUrl = String(base64Payload).includes('data:')
            ? base64Payload
            : `data:application/pdf;base64,${base64Payload}`;
        const blob = dataURLToBlob(dataUrl);
        if (!blob) {
            return { status: false, message: 'Could not read document' };
        }
        const formData = new FormData();
        formData.append('File', blob, fileName);
        const res = await dispatch(uploadSocialPostDocuments({ payload: formData }));
        const uploaded = Array.isArray(res?.data) ? res?.data : [];
        const url = uploaded[0]?.url;
        if (res?.status && url) {
            setSocialPostGalleryImages([]);
            setValue('browserImage', url);
            setValue('previewImage', url);
            setValue('uploadImage', url);
            return { status: true, message: res?.message || 'Document uploaded successfully' };
        }
        return { status: false, message: res?.message || 'Document upload failed' };
    };

    useEffect(() => {
        if (Object.hasOwn(errors, 'boostPost')) {
            setIsBoostError('Complete the target information to proceed ');
        }
    }, [errors]);

    useEffect(() => {
        if (boostPostAry?.length === 4) {
            // debugger;
            clearErrors('boostPost', '');
        }
        if (Object.hasOwn(errors, 'boostPost')) {
            setIsBoostError('Complete the target information to proceed ');
        } else {
            setIsBoostError(null);
        }
    }, [boostPostAry]);

    const handleErrClose = () => {
        if (isSPFail) {
            navigate('/communication', {
                index: 0,
            });
        }
    };

    const getMaxLengthByType = () => getTextLimit(type, postType);
    const isCaptionEditorDisabled = isSocialPostCaptionEditorDisabled(type, postType);

    useEffect(() => {
        if (isCaptionEditorDisabled) {
            clearErrors('editorText');
            unregister('editorText')
        }
    }, [isCaptionEditorDisabled, clearErrors]);

    return (
        <AuthoringChannelEditSkeletonGate channelId={channelId} isLoading={showEditSkeleton && isSavedChannel}>
            <FormProvider {...methods}>
                <div className="rsv-tabs-content position-relative allow-copy">
                    <div
                        className={`box-design bd-top-border ${checkTrigger(locationAds?.campaignType, locationAds?.endDate)
                            ? 'pe-none click-off'
                            : !statusIdCheck(fetchedSocialPostStatusId, location?.campaignType, undefined)
                                ? 'click-off'
                                : ''
                            }`}
                    >
                        <SmartLinkEnable
                                    onSave={() => setIsSmartLink(false)}
                                    onReject={() => {
                                        dispatch(showTabsSmartlink(true));
                                        setIsSmartLink(false);
                                    }}
                                />
                        <div className="form-group pt20">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{POST_NAME}</label>
                                </Col>
                                <Col sm={6}>
                                    <RSInput
                                        required
                                        id="rs_SocialPost_postName"
                                        control={control}
                                        name={'postName'}
                                        placeholder={POST_NAME}
                                        onKeyDown={charNumUnderScore}
                                        restrictSpecialChars
                                        minLength={MIN_LENGTH}
                                        rules={{
                                            required: ENTER_SOCIAL_POST,
                                            minLength: {
                                                value: MIN_LENGTH,
                                                message: MINLENGTH,
                                            },
                                        }}
                                        maxLength={MAX_LENGTH200}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {/* {type === 'facebook' && ( */}
                        <div className="form-group post_on_group">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{POST_ON}</label>
                                </Col>
                                <Col sm={6}>
                                    <Row>
                                        {/* {locationAds?.campaignType !== 'T' && type === 'facebook' && (
                                        <Fragment>
                                            <Col md={5} id="rs_SocialPost_postOnAudience">
                                                <RSMultiSelect
                                                    className={
                                                        audienceList?.postSecondItem?.length > 0 ||
                                                        getValues('postOnList')?.length > 0
                                                            ? 'click-off'
                                                            : ''
                                                    }
                                                    control={control}
                                                    name={'postOnAudience'}
                                                    data={audience}
                                                    textField={'recipientsBunchName'}
                                                    dataItemKey={'segmentationListId'}
                                                    label="Audience list"
                                                    handleChange={(e) => {
                                                        clearErrors('postOnAudience');
                                                        clearErrors('postOnList');
                                                        setAudienceList({
                                                            postFirstItem: e.value,
                                                            postSecondItem: [],
                                                        });
                                                    }}
                                                    rules={
                                                        audienceList?.postFirstItem?.length !== 0 && {
                                                            required: SELECT_AUDIENCE_LIST,
                                                            validate: audienceListValidator,
                                                        }
                                                    }
                                                />
                                            </Col>
                                            <Col md={2} className="rs-or-wrapper">
                                                <div className="rs-or-with-pipe">
                                                    <small>OR</small>
                                                </div>
                                            </Col>
                                        </Fragment>
                                    )} */}
                                        <Col md={12} id="rs_SocialPost_postOnList">
                                            <RSKendoDropDownList
                                                data={socialMediaDropDown}
                                                isLoading={postOnLoader.isLoading}
                                                className={
                                                    audienceList?.postFirstItem?.length > 0 ||
                                                        getValues('postOnAudience')?.length > 0
                                                        ? 'click-off'
                                                        : ''
                                                }
                                                control={control}
                                                name={'postOnList'}
                                                textField={'pageName'}
                                                label={POST_ON}
                                                dataItemKey={'socialMediaSetupId'}
                                                handleChange={(e) => {
                                                    setAudienceList({ postSecondItem: [e.value], postFirstItem: [] });
                                                    clearErrors('postOnAudience');
                                                    clearErrors('postOnList');
                                                }}
                                                rules={
                                                    // (audienceList?.postSecondItem?.length !== 0 || type === 'facebook') &&
                                                    {
                                                        required: SELECT_POST_ON,
                                                    }
                                                }
                                                defaultValue={postOnList}
                                                required
                                                footer={
                                                    <RSDropdownFooterBtn
                                                        title={ADD_POST}
                                                        handleClick={() => {
                                                            const state = {
                                                                backPath: window.location.search,
                                                                remoteDataSourceID: getRemoteSource(),
                                                                fromCommunication: true,
                                                            };
                                                            localStorage.setItem('socialPostQuery', encodeUrl(state));
                                                            const url = '/preferences/data-exchange';
                                                            navigate(`${url}?q=${encodeUrl(state)}`, { state });
                                                        }}
                                                    />
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                {/* <Col sm={1} className="fg-icons-wrapper pl0">
                                <div className="fg-icons">
                                    {type !== 'instagram' && (
                                        <div className="d-flex">
                                            <RSTooltip text={'Refresh'}>
                                                <i
                                                    id="rs_data_refresh"
                                                    className={`${refresh_large} color-primary-blue icon-md cp`}
                                                    onClick={() => {
                                                        setRefresh(true);
                                                    }}
                                                />
                                            </RSTooltip>
                                        </div>
                                    )}
                                </div>
                            </Col> */}
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row>
                                <Col sm={{ offset: 1, span: 10 }}>
                                    <PostTypeVisualSelect
                                        options={postTypeOptions}
                                        value={postType}
                                        onSelect={handlePostTypeCardSelect}
                                        lockOtherOptions={hasUserSelectedPostType && !!postType}
                                        showReset={hasUserSelectedPostType && !!postType}
                                        onReset={handlePostTypeReset}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {/* )} */}
                        {/* {type === 'facebook' && (
                        <div className="form-group fg-wl-textfield">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{BOOST_POST}</label>
                                </Col>
                                <Col sm={6}>
                                    <RSSwitch
                                        name={'isBoostPost'}
                                        control={control}
                                        id="rs_SocialPost_Boostpost"
                                        handleChange={(e) => {
                                            if (!e) {
                                                clearErrors('boostPost');
                                                setIsBoostError('');
                                            }
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )} */}
                        {isBoostPost && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{TARGET}</label>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="rs-communication-target-wrapper">
                                            <div className="mt5 d-flex  gap-1">
                                                <i
                                                    className={`${communication_target_medium} color-primary-blue icon-md`}
                                                    onClick={() => setTargetPopover(!targetPopover)}
                                                    id="rs_SocialPost_communication_target"
                                                />
                                                <small className="color-primary-red">{isBoostError}</small>
                                            </div>
                                            {targetPopover && (
                                                <BoostPost
                                                    isDirty={formDirty}
                                                    isValid={isValid}
                                                    boostPostAry={boostPostAry}
                                                    isBoostPostSaved={isBoostPostSaved}
                                                    handleBoostPostSaved={(data) => {
                                                        setBoostPostSaved(true);
                                                        setBoostPostAry(data);
                                                    }}
                                                    handleClose={(status) => {
                                                        setTargetPopover(false);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {isBoostpostSaved && (
                            <Row className="mb24">
                                <Col md={{ offset: 4 }}>
                                    <span>{COUNTRY} </span>
                                    <span className="color-primary-blue">{_get(boostPost, 'country.country', '')},</span>
                                    <span className="ml10">{CITY} </span>
                                    <span className="color-primary-blue">{_get(boostPost, 'city', '')},</span>
                                    <span className="ml10">{AGE} </span>
                                    <span className="color-primary-blue">
                                        {_get(boostPost, 'ageFrom', '')} - {_get(boostPost, 'ageTo', '')},
                                    </span>
                                    <span className="ml10">{GENDER} </span>
                                    <span className="color-primary-blue">{_get(boostPost, 'gender', '')},</span>
                                    <i
                                        id="rs_data_pencil_edit"
                                        className={`${pencil_edit_medium} icon-md color-primary-blue ml10`}
                                        onClick={() => setTargetPopover(true)}
                                    />
                                </Col>
                            </Row>
                        )}
                        {/* <div className="form-group">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">Enter your post text</label>
                            </Col>
                            <Col sm={5}>
                                <div className="rs-textarea-component-wrapper">
                                    <div className="rstcw-top-icons">
                                        <ul>
                                            <li title="Insert emoji">
                                                <EmojiPicker
                                                    onEmojiSelect={(e) => {
                                                        handleChange(e?.native, 'static');
                                                    }}
                                                />
                                            </li>

                                            <li title="Upload image">
                                                <ImageUpload
                                                    isPrefix={false}
                                                    isbase64={true}
                                                    channelType={'socialMedia'}
                                                    handleImageData={handleImageData}
                                                    setImagePreviewStatus={() => {
                                                        setImagePreviewStatus(true);
                                                    }}
                                                />
                                            </li>
                                            <li title="Insert SmartLink">
                                                <RSBootstrapdown
                                                    data={smartLinks}
                                                    flatIcon
                                                    isObject
                                                    idKey="id"
                                                    fieldKey="menuLabel"
                                                    defaultItem={{
                                                        id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                                                        menuLabel: <i className={`${smart_link_medium} icon-md`} />,
                                                    }}
                                                    showUpdate={false}
                                                    name="smartlink"
                                                    className="no_caret"
                                                    isLoading={smartLinkInsertLoader.isLoading}
                                                    footer={
                                                        smartLinks.length < MAX_SMART_LINKS ? (
                                                            <div
                                                                className="dropdown-footer-btn"
                                                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                                onClick={handleOpenWithAdd}
                                                            >
                                                                <span>Add Smart Link</span>
                                                                <i className={`${circle_plus_fill_medium} icon-md`} />
                                                            </div>
                                                        ) : null
                                                    }
                                                    onSelect={(e) => handleChange(e, 'dynamic')}
                                                />
                                            </li>

                                            <li
                                                title="Preview"
                                                className={`${eye_medium} icon-md cp`}
                                                onClick={() => {
                                                    setPreviewFlage(true);
                                                }}
                                            ></li>
                                        </ul>
                                    </div>
                                    <div className="rstcw-textarea-holder">
                                        <RSTextarea
                                            control={control}
                                            name={'editorText'}
                                            maxLength={150}
                                            onKeyUp={(e) => handleSelectionChange(e)}
                                            onClick={(e) => handleSelectionChange(e)}
                                            rules={{
                                                required: ENTER_EDITOR_TEXT,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                            {imagePreviewStatus && (
                                <Col sm={3} className="pr0 pl0">
                                    <Preview {...previewProps} />
                                </Col>
                            )}

                            {getValues('browserImage') !== undefined && (
                                <Col sm={3} className="pr0 pl0">
                                    <Preview previewImage={getValues('browserImage')} />
                                </Col>
                            )}
                        </Row>
                    </div> */}

                        <div className="pt15 pb41 ">
                            {/* <div className="form-group mb0">
                            <Row>
                                <Col sm={{ offset: 1, span: 10 }}>
                                    <div className="rs-live-preview-wrapper mt30">
                                        <div className="rsamp-text">{PREVIEW}</div>
                                    </div>
                                </Col>
                            </Row>
                        </div> */}
                            {/* <Row>
                            <Col sm={{ offset: 1, span: 3 }} className="mb8">
                                <label className="control-label-left">{ENTER_YOUR_POST_TEXT}</label>
                            </Col>
                        </Row> */}
                        <Row>
                            {/* Left column starts */}
                            <Col
                                sm={{ offset: 1, span: 5 }}
                                className={['valid-enter-msg', isCaptionEditorDisabled ? 'click-off pe-none' : '']
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                <div className="rs-textarea-component-wrapper">
                                    <div className="rstcw-top-icons">
                                        <ul className="float-left">
                                            <li className="emoji-top">
                                                    <EmojiPicker
                                                        onEmojiSelect={(e) => {
                                                            handleChange(e?.native, 'static', 'emoji');
                                                        }}
                                                        isTextEditor
                                                        tooltipText= {"Insert emoji"}
                                                    />
                                            </li>

                                                <li
                                                    className={
                                                        !canOpenSocialPostMediaUploadFromToolbar
                                                            ? 'click-off opacity-50'
                                                            : ''
                                                    }
                                                >
                                                    <RSTooltip text="Upload media" position="top">
                                                        <i
                                                            id="rs_social_post_toolbar_upload_media"
                                                            role="button"
                                                            tabIndex={0}
                                                            className={`${builder_upload_medium} icon-md color-primary-blue`}
                                                            onClick={() => openSocialPostMediaUploadFromToolbar()}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    openSocialPostMediaUploadFromToolbar();
                                                                }
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                </li>

                                            <li>
                                                <RSTooltip text="Insert SmartLink">
                                                    <RSBootstrapdown
                                                        data={smartLinks}
                                                        flatIcon
                                                        isObject
                                                        idKey="id"
                                                        fieldKey="menuLabel"
                                                        defaultItem={{
                                                            id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                                                            menuLabel: (
                                                                <i
                                                                    className={`${editor_smart_link_medium} icon-md`}
                                                                />
                                                            ),
                                                        }}
                                                        showUpdate={false}
                                                        name="smartlink"
                                                        className="no_caret"
                                                        popupSettings={{
                                                            popupClass: `addImportSmartLinkDropdownListContainer`,
                                                        }}
                                                        footer={
                                                            smartLinks.length < MAX_SMART_LINKS ? (
                                                                <div
                                                                    className="dropdown-footer-item"
                                                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                                    onClick={handleOpenWithAdd}
                                                                >
                                                                    <span>Add Smart Link</span>
                                                                    <i className={`${circle_plus_fill_medium} icon-md color-primary-blue`} />
                                                                </div>
                                                            ) : null
                                                        }
                                                        onSelect={(e) => handleChange(e, 'dynamic')}
                                                    />
                                                </RSTooltip>
                                            </li>
                                        </ul>
                                        <ul className="float-right position-relative right-10 preview-right">
                                            <RSTooltip position="top" text={PREVIEW} >
                                                <li
                                                    className={`${eye_medium} icon-md cp ${editorText?.length > 0 ||
                                                        getValues('browserImage') ||
                                                        getValues('previewImage') ||
                                                        socialPostGalleryImages.length > 0
                                                        ? ''
                                                        : 'click-off'
                                                        } border-0`}
                                                    id="rs_data_eye"
                                                    onClick={() => {
                                                        if (
                                                            editorText?.length > 0 ||
                                                            getValues('browserImage') ||
                                                            getValues('previewImage') ||
                                                            socialPostGalleryImages.length > 0
                                                        ) {
                                                            setPreviewFlage(true);
                                                        }
                                                    }}
                                                ></li>
                                            </RSTooltip>
                                        </ul>
                                    </div>
                                    {/* Hidden upload triggers — modals open from post-type card or editor toolbar media icon. */}
                                    {(imageUploadVariant === 'image' || imageUploadVariant === 'article') &&
                                        imageUploadMax <= 1 ? (
                                        <ImageUpload
                                            key={`hidden-img-${imageUploadResetKey}`}
                                            isPrefix={false}
                                            isbase64={true}
                                            channelType={'socialMedia'}
                                            size={getImageSpecs(type, postType).maxFileSize}
                                            isCustomFormat={['facebook', 'twitter', 'linkedIn', 'pinterest'].includes(type)}
                                            isWhatsApp={type === 'instagram'}
                                            platformType={type}
                                            socialPostType={postType}
                                            hideDefaultTrigger
                                            openImageUploadModal={socialPostAutoOpenSingleUpload}
                                            onImageUploadModalRequestClose={() =>
                                                setSocialPostAutoOpenSingleUpload(false)
                                            }
                                            handleImageData={async (data, fileName, contentLength) => {
                                                const res = await handleImageData(data, fileName, contentLength);
                                                return res;
                                            }}
                                            setImagePreviewStatus={() => {
                                                setImagePreviewStatus(true);
                                            }}
                                            contentType={'img'}
                                            setShowTooltip={() => { }}
                                        />
                                    ) : null}
                                    {imageUploadMax > 1 ? (
                                        <MultiImageUpload
                                            key={`hidden-multi-${imageUploadResetKey}`}
                                            maxImages={imageUploadMax}
                                            platformType={type}
                                            socialPostType={postType}
                                            size={getImageSpecs(type, postType).maxFileSize}
                                            initialGallery={socialPostGalleryImages}
                                            onCommittedImages={setSocialPostGalleryImages}
                                            InsertImage={() => setImagePreviewStatus(true)}
                                            autoOpenUploadKey={socialPostAutoOpenMultiUploadKey}
                                            onAutoOpenUploadConsumed={handleMultiUploadAutoOpenConsumed}
                                            hideDefaultTrigger
                                        />
                                    ) : null}
                                    {imageUploadVariant === 'video' && isVideoSupported(type, postType) ? (
                                        <ImageUpload
                                            key={`hidden-vid-${imageUploadResetKey}`}
                                            isPrefix={false}
                                            isbase64={true}
                                            contentType={'video'}
                                            channelType={'socialMedia'}
                                            size={getVideoSpecs(type, postType).maxFileSize}
                                            platformType={type}
                                            socialPostType={postType}
                                            hideDefaultTrigger
                                            openImageUploadModal={socialPostAutoOpenVideoUpload}
                                            onImageUploadModalRequestClose={() =>
                                                setSocialPostAutoOpenVideoUpload(false)
                                            }
                                            deferImageApplyUntilUpload
                                            onApplyImageUrlFromModal={applySocialPostVideoUrlFromModal}
                                            handleImageData={async (base64, fileName, contentLength, file) => {
                                                const res = await handleVideoData(base64, fileName, contentLength, file);
                                                return res;
                                            }}
                                            setImagePreviewStatus={() => {
                                                setImagePreviewStatus(true);
                                            }}
                                            setShowTooltip={() => { }}
                                            onClearedMedia={() => setMediaType('Image')}
                                        />
                                    ) : null}
                                    {imageUploadVariant === 'story' ? (
                                        <ImageUpload
                                            key={`hidden-story-${imageUploadResetKey}`}
                                            isPrefix={false}
                                            isbase64={true}
                                            contentType={'story'}
                                            channelType={'socialMedia'}
                                            size={Math.max(
                                                getImageSpecs(type, postType).maxFileSize,
                                                getVideoSpecs(type, postType).maxFileSize,
                                            )}
                                            platformType={type}
                                            socialPostType={postType}
                                            hideDefaultTrigger
                                            openImageUploadModal={socialPostAutoOpenVideoUpload}
                                            onImageUploadModalRequestClose={() =>
                                                setSocialPostAutoOpenVideoUpload(false)
                                            }
                                            deferImageApplyUntilUpload
                                            onApplyImageUrlFromModal={applySocialPostStoryUrlFromModal}
                                            handleImageData={async (data, fileName, contentLength) => {
                                                const res = await handleImageData(data, fileName, contentLength);
                                                return res;
                                            }}
                                            handleVideoData={async (base64, fileName, contentLength, file) => {
                                                const res = await handleVideoData(base64, fileName, contentLength, file);
                                                return res;
                                            }}
                                            setImagePreviewStatus={() => {
                                                setImagePreviewStatus(true);
                                            }}
                                            setShowTooltip={() => { }}
                                            onClearedMedia={() => setMediaType('Image')}
                                        />
                                    ) : null}
                                    {imageUploadVariant === 'pdf' ? (
                                        <ImageUpload
                                            key={`hidden-pdf-${imageUploadResetKey}`}
                                            isPrefix={false}
                                            isbase64={true}
                                            channelType={'socialMedia'}
                                            contentType={'pdf'}
                                            size={getDocumentSpecs(type, postType).maxFileSize}
                                            platformType={type}
                                            socialPostType={postType}
                                            hideDefaultTrigger
                                            openImageUploadModal={socialPostAutoOpenPdfUpload}
                                            onImageUploadModalRequestClose={() => setSocialPostAutoOpenPdfUpload(false)}
                                            handleImageData={async (data, fileName, contentLength) => {
                                                const res = await handleDocumentData(data, fileName, contentLength);
                                                return res;
                                            }}
                                            setImagePreviewStatus={() => {
                                                setImagePreviewStatus(true);
                                            }}
                                            setShowTooltip={() => { }}
                                        />
                                    ) : null}
                                    <div className="rstcw-textarea-holder social-post-editor-textarea">
                                        <RSTextarea
                                            key={`social-post-editor-${postTypeMediaResetKey}`}
                                            control={control}
                                            name={'editorText'}
                                            className={'social-post-editor'}
                                            maxLength={getMaxLengthByType()}
                                            onKeyUp={(e) => handleSelectionChange(e)}
                                            onClick={(e) => handleSelectionChange(e)}
                                            rules={
                                                isCaptionEditorDisabled
                                                    ? {}
                                                    : {
                                                          required: ENTER_EDITOR_TEXT,
                                                      }
                                            }
                                            disabled={isCaptionEditorDisabled}
                                        />
                                    </div>
                                </div>
                                <small className="text-right">
                                    {numberWithCommas(editorText?.length ?? 0)}/ {numberWithCommas(getMaxLengthByType())}
                                </small>
                            </Col>
                            {/* /Left column ends */}
                            {/* Right column starts */}
                            <Col sm={5} className="emojifont">
                                <div className="rs-social-post-preview-column">
                                    <RSSocialPostPreview
                                        socialPostType={type}
                                        editorText={editorText}
                                        previewImage={browserImage || previewImage || ''}
                                        mediaType={mediaType}
                                        scheduleDate={schedule}
                                    >
                                        <>
                                            {(socialPostGalleryImages.length > 0 ||
                                                String(previewImage || '').trim() ||
                                                String(browserImage || '').trim() ||
                                                String(uploadImage || '').trim()) && (
                                                    <Preview
                                                        key={`social-post-preview-${postTypeMediaResetKey}`}
                                                        previewImage={browserImage || previewImage || uploadImage || ''}
                                                        galleryImages={socialPostGalleryImages}
                                                        previewLayout={
                                                            type === 'instagram' || type === 'pinterest'
                                                                ? 'instagram'
                                                                : type === 'facebook'
                                                                    ? 'facebook'
                                                                    : type === 'linkedIn'
                                                                        ? 'linkedIn'
                                                                        : 'default'
                                                        }
                                                        previewMediaType={
                                                            imageUploadVariant === 'video'
                                                                ? 'video'
                                                                : imageUploadVariant === 'pdf'
                                                                    ? 'pdf'
                                                                    : 'image'
                                                        }
                                                        mode={locationAds?.isEditable}
                                                    />
                                                )}
                                        </>
                                    </RSSocialPostPreview>

                                        {
                                            postType &&
                                            <div className="rs-social-post-preview-column__spec-footer mt5 w-100">
                                                <small className="d-flex align-items-center float-end">Info
                                                    <RSTooltip text="Info" className="lh0">
                                                        <i
                                                            className={`${circle_info_medium} icon-md color-primary-blue ml5`}
                                                            aria-hidden
                                                            onClick={() => setCarouselSpecModalOpen(true)}
                                                        />
                                                    </RSTooltip>

                                                </small>

                                            </div>
                                        }
                                    </div>
                                    {/* <div className={`rs-social-post-live-preview-wrapper rssplp-${type}`}> */}
                                    {/* <div className="rs-social-live-preview-content">
                                        <div className="rs-social-live-preview-image">
                                            {imagePreviewStatus && <Preview {...previewProps} />}
                                            {getValues('browserImage') !== undefined && (
                                                <Preview previewImage={getValues('browserImage')} />
                                            )}
                                        </div>
                                    </div> */}
                                    {/* </div> */}
                                </Col>
                                {/* /Right column ends */}
                            </Row>
                        </div>

                        {/* {type !== 'twitter' && (
                        <div className="form-group d-none">
                            <Row>
                                <Col sm={{ offset: 1, span: 2 }}>
                                    <label className="control-label-left">{POST_LINK}</label>
                                </Col>
                                <Col sm={6}>
                                    <RSInput
                                        control={control}
                                        id="rs_SocialPost_postlink"
                                        name={'postLink'}
                                        placeholder={POST_LINK}
                                        required
                                        handleOnBlur={async ({ target: { value } }) => {
                                            // vennila feedback
                                            // const { status } = await dispatch(
                                            //     validateWebsite({
                                            //         payload: { Website: value },
                                            //         setError,
                                            //         name: `postLink`,
                                            //     }),
                                            // );
                                            // if (status) {
                                            //     clearErrors(`postLink`);
                                            // } else {
                                            // }
                                        }}
                                        rules={{
                                            required: ENTER_URL,
                                            validate: async (value) => {
                                                const URLCheck = await IsValidURL(value);
                                                setValidateURL(URLCheck === true);
                                                return URLCheck || INVALID_URL;
                                            },
                                        }}
                                        maxLength={MAXL_LENGTH2000}
                                        isValidIcon={validateURL}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )} */}
                        {/* <div className="form-group d-none">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">#{TRENDING_TOPICS}</label>
                            </Col>
                            <Col sm={6} className="position-relative">
                                <RSTagsComponent
                                    isNoOfCharacters={false}
                                    id="rs_SocialPost_Trendingtopics"
                                    key={'topics'}
                                    isRefresh={false}
                                    tags={trendingTopics}
                                    maxLength={100}
                                    placeholder={TRENDING_TOPICS}
                                    errorMessage={trendingTopicsErrorMessage}
                                    updatedTags={(tags) => {
                                        setValue('trendingTopics', tags);
                                        if (trendingTopicsErrorMessage !== null) {
                                            clearErrors('trendingTopics');
                                        }
                                    }}
                                    isHashTag
                                />
                                <div className="position-absolute right18 bottom-25">
                                    <RSPPophover pophover={'View analytics for trending topics'}>
                                        <i
                                            className={`${circle_question_mark_mini} icon-xs top5 color-primary-blue lh0`}
                                            id="circle_question_mark"
                                        />
                                    </RSPPophover>
                                </div>
                            </Col>
                        </Row>
                    </div> */}
                    {renderScheduler && (
                        <Scheduler
                            utcTime_Data={utcTimeData}
                            key={`scheduler-${type}`}
                            isSendTimeRecommendation={false}
                            isRequired={false}
                            isRfaEnabled={false}
                            disableAutoScroll={true}
                            rootClassName = {'mb30'}
                        />
                    )}
                </div>

                    <div className="buttons-holder">
                        <RSSecondaryButton
                            onClick={() => {
                                navigate('/communication');
                            }}
                            id="rs_SocialPost_Cancel"
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSSecondaryButton
                            className={`color-primary-blue${checkTrigger(location?.campaignType, location?.endDate)
                                ? 'pe-none click-off'
                                : !statusIdCheck(fetchedSocialPostStatusId, location?.campaignType, undefined)
                                    ? 'pe-none click-off'
                                    : ''
                                } ${Object.keys(errors)?.length > 0 ? 'click-off' : ''} ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                            onClick={() => {
                                if (isPastPlanDurationBlocked) return;
                                handleSubmit((data) => postSaveSocialPost(data, 'save'))();
                            }}
                            name="saveButton"
                            id="rs_SocialPost_Save"
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents
                            disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                        >
                            {SAVE}
                        </RSSecondaryButton>

                        <RSPrimaryButton
                            className={` ${checkTrigger(location?.campaignType, location?.endDate)
                                ? 'pe-none click-off'
                                : !statusIdCheck(fetchedSocialPostStatusId, location?.campaignType, undefined)
                                    ? 'pe-none click-off'
                                    : ''
                                } ${Object.keys(errors)?.length > 0 ? 'click-off' : ''} ${isDirty && Object.keys(errors)?.length > 0 ? 'click-off' : ''
                                } ${isPastPlanDurationBlocked ? PAST_PLAN_DURATION_CLICK_OFF_CLASS : ''}`}
                            isLoading={isNextLoading}
                            blockBodyPointerEvents
                            disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                            onClick={() => {
                                if (isPastPlanDurationBlocked) return;
                                if (!isDirty && !isValid) {
                                    if (!shouldPromptSkipChannelConfirmation()) {
                                    handleNavigation();
                                    return;
                                }
                                setNavigate_confirm(true);
                                } else {
                                    handleSubmit((data) => postSaveSocialPost(data, 'next'))();
                                }
                            }}
                            name="saveButton"
                            id="rs_SocialPost_Next"
                        >
                            {NEXT}
                        </RSPrimaryButton>
                    </div>
                </div>
                {/* //Modals*/}

                <RSConfirmationModal
                    header={RESET}
                    show={isRefresh}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    handleConfirm={() => {
                        setAudienceList({ postSecondItem: [], postFirstItem: [] });
                        setRefresh(false);
                        reset((formState) => ({
                            ...formState,
                            postOnList: [],
                            postOnAudience: [],
                        }));
                    }}
                    handleClose={() => setRefresh(false)}
                />
                <PreviewModal
                    type={type}
                    previewFlag={previewFlag}
                    setPreviewFlage={setPreviewFlage}
                    editorText={editorText}
                    mode={locationAds?.isEditable}
                    previewImage={String(getValues('browserImage') || getValues('previewImage') || previewImage || '').trim()}
                    galleryImages={socialPostGalleryImages}
                    previewLayout={
                        type === 'instagram' || type === 'pinterest'
                            ? 'instagram'
                            : type === 'facebook'
                                ? 'facebook'
                                : type === 'linkedIn'
                                    ? 'linkedIn'
                                    : 'default'
                    }
                    previewMediaType={
                        imageUploadVariant === 'video' ? 'video' : imageUploadVariant === 'pdf' ? 'pdf' : 'image'
                    }
                    scheduleDate={schedule}
                />
                <CarouselMultiImageSpecModal
                    show={carouselSpecModalOpen}
                    onClose={() => setCarouselSpecModalOpen(false)}
                    channelType={type}
                    postType={postType}
                />
                <RSConfirmationModal
                    show={navigate_confirm}
                    text={IGNORE_CHANNEL}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setNavigate_confirm(false);
                    }}
                    handleConfirm={() => {
                        tabChange();
                        setNavigate_confirm(false);
                    }}
                />
                <RSConfirmationModal
                    show={mediaStatus}
                    text={'Upload media content to proceed.'}
                    primaryButtonText={OK}
                    handleClose={() => {
                        setMediaStatus(false);
                    }}
                    handleConfirm={() => {
                        setMediaStatus(false);
                    }}
                    secondaryButton={false}
                />
                <RSConfirmationModal
                    show={showConfirmationStatus}
                    text={COMMUNICATION_SCHEDULED}
                    primaryButtonText={SAVE}
                    handleClose={() => {
                        setShowConfirmationStatus(false);
                    }}
                    handleConfirm={() => {
                        handleSubmit((data) => postSaveSocialPost(data, 'confirmationSave'))();
                        setShowConfirmationStatus(false);
                    }}
                />
                <RSConfirmationModal
                    show={postTypeMediaSwitchConfirm}
                    header={CONFIRM}
                    text={
                        'Switching post type will remove uploaded images, videos, or documents. Continue?'
                    }
                    primaryButtonText={OK}
                    secondaryButtonText={CANCEL}
                    handleClose={() => {
                        setPostTypeMediaSwitchConfirm(false);
                        setPendingPostTypeOption(null);
                    }}
                    handleConfirm={() => {
                        clearUploadedSocialMedia();
                        const nextOpt = pendingPostTypeOption;
                        if (nextOpt && isPostTypeOptionSelectable(nextOpt)) {
                            setValue('postType', nextOpt, { shouldDirty: true, shouldTouch: true });
                            setHasUserSelectedPostType(true);
                            if (shouldAutoOpenSocialPostMediaUploadOnPostTypeSelect(nextOpt.id)) {
                                if (isSingleImageSocialPostTypeId(nextOpt.id)) {
                                    setSocialPostAutoOpenSingleUpload(true);
                                } else if (isMultiSlideSocialPostTypeId(nextOpt.id)) {
                                    setSocialPostAutoOpenMultiUploadKey((n) => n + 1);
                                } else if (isVideoSocialPostTypeId(nextOpt.id)) {
                                    setSocialPostAutoOpenVideoUpload(true);
                                } else if (isPdfSocialPostTypeId(nextOpt.id)) {
                                    setSocialPostAutoOpenPdfUpload(true);
                                }
                            }
                        }
                        setPostTypeMediaSwitchConfirm(false);
                        setPendingPostTypeOption(null);
                    }}
                />
                {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
            </FormProvider>
        </AuthoringChannelEditSkeletonGate>
    );
};

export default SocialPost;
