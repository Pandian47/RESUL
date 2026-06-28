import { decryptWithAES, encodeUrl } from 'Utils/modules/crypto';
import { convertToUserTimezone, getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import RSTabbar from 'Components/RSTabber';
import { useFormContext, useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';

import {
    get_offersnippentLists,
    get_offersnippentNameExist,
    fetch_offersnippetById,
    delete_offersnippetById,
} from 'Reducers/preferences/EmailBuilder/request';

import CardCommunication from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/Template/Component/Card';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import RSTooltip from 'Components/RSTooltip';
import RSPager from 'Components/RSPager';
import RSSearchField from 'Components/RSSearchField';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import { INITIAL_PAGE_CONFIG } from 'Components/RSPager/constant';
import { CANCEL, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { form_edit_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { SnippetTemplateSkeleton } from '../../../../../../../../Components/Skeleton/Components/SkeletonOverall';
import useQueryParams from 'Hooks/useQueryParams';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



// Resolution sizes for template grid
const ImageSettingCommonResolution = [
    { id: 1, size: '120x240', label: '120x240' },
    { id: 2, size: '120x90', label: '120x90' },
    { id: 3, size: '120x60', label: '120x60' },
    { id: 4, size: '120x600', label: '120x600' },
    { id: 5, size: '240x400', label: '240x400' },
    { id: 6, size: '234x60', label: '234x60' },
    { id: 7, size: '250x250', label: '250x250' },
    { id: 8, size: '300x250', label: '300x250' },
    { id: 9, size: '300x100', label: '300x100' },
    { id: 10, size: '300x600', label: '300x600' },
    { id: 11, size: '336x280', label: '336x280' },
    { id: 12, size: '320x480', label: '320x480' },
];

const SnippetTemplate = ({ mediaTypeCode, mediaTypeSnippet, autoSelectSnippetId, handleSave, isSaveLoading = false }) => {
    const {
        watch,
        setValue,
        getValues,
        trigger,
        formState: { errors },
    } = useFormContext();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const deleteApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDeleteLoading = deleteApi.isFetching;
    const locationState = useQueryParams('preferences');
    const getIsEdit = locationState?.isEdit || false;
    // Extract offerId from URL if it exists (for edit mode)
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const offerIdFromUrl = searchParams.get('offerId');
    const offerIdFromUrlNumber = offerIdFromUrl ? Number(offerIdFromUrl) : null;
    const qParam = searchParams.get('q');
    const offerIdFromQuery = useMemo(() => {
        if (!qParam) return null;
        try {
            const decoded = decodeLargeState(qParam);
            if (decoded && decoded.offerId) {
                return typeof decoded.offerId === 'string' ? Number(decoded.offerId) : decoded.offerId;
            }
            const normalizedParam = qParam.replaceAll(' ', '+');
            const decryptedState = decryptWithAES(decodeURIComponent(normalizedParam));
            const parsed = JSON.parse(decryptedState);
            if (parsed && parsed.offerId) {
                return typeof parsed.offerId === 'string' ? Number(parsed.offerId) : parsed.offerId;
            }
        } catch (e) { }
        return null;
    }, [qParam]);

    // Use offerId from URL or query param
    const currentOfferId = offerIdFromUrlNumber || offerIdFromQuery;
    const { currencyMasterList } = getmasterData() || {};
    // Get master data from Redux for form population
    const {
        getOfferTypeData,
        getCommunicationType,
        getProductType,
        getCategory,
        getSubCategory,
        getSubProductType,
        getEditedData,
    } = useSelector((state) => state.offerMangementReducer);
    const [selectedTemplateTab, setSelectedTemplateTab] = useState(0);
    const [selectedResolution, setSelectedResolution] = useState(null);
    const [offerSnippets, setOfferSnippets] = useState([]);
    const [loadingSnippets, setLoadingSnippets] = useState(false);
    const [loadingSnippet, setLoadingSnippet] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [snippetToDelete, setSnippetToDelete] = useState(null);

    // Watch form values for selectedSnippetId (used in edit mode)
    const selectedSnippetId = watch('selectedSnippetId');
    const selectedSnippetNameValue = watch('selectedSnippetName');

    // Pagination and search state
    const [payload, setPayload] = useState(() => ({
        departmentId,
        clientId,
        userId,
        channelId: 1,
        templatecategory: 'All template',
        pagination: {
            pageNo: 1,
            recordLimit: 6,
        },
        isFilter: false,
        filteration: {
            snippetName: '',
            startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: getYYMMDD(new Date()),
        },
    }));
    const [pagerPageConfig, setPagerPageConfig] = useState(INITIAL_PAGE_CONFIG);
    const [searchDiv, setSearchDiv] = useState(false);
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [refreshCounter, setRefreshCounter] = useState(0);

    // Preview state - separate from previewData
    const [snippetPreviewImage, setSnippetPreviewImage] = useState('');
    const [selectedSnippetName, setSelectedSnippetName] = useState('');
    const previewContainerRef = useRef(null);

    // Simple state to track auto-select - no refs, no polling
    const [pendingAutoSelectId, setPendingAutoSelectId] = useState(null);
    const [hasAutoSelectedId, setHasAutoSelectedId] = useState(null);
    const [hasManuallyReset, setHasManuallyReset] = useState(false);
    const isResetRef = useRef(false);

    // Helper functions for timezone-adjusted dates
    const getTimezoneAdjustedStartDate = () => {
        return convertToUserTimezone(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER), { formatAsString: false });
    };

    const getTimezoneAdjustedEndDate = () => {
        return convertToUserTimezone(new Date(), { formatAsString: false });
    };

    const [dates, setDates] = useState({
        startDate: getTimezoneAdjustedStartDate(),
        endDate: getTimezoneAdjustedEndDate(),
        selectedDateText: 'Last 30 days',
    });

    // Form for template modal
    const modalMethods = useForm({
        defaultValues: {
            offerName: '',
        },
    });
    const {
        control: modalControl,
        handleSubmit: handleModalSubmit,
        getValues: getModalValues,
        setValue: setModalValue,
        setError: setModalError,
        clearErrors: clearModalErrors,
        setFocus: setModalFocus,
        formState: { isValid: isModalValid },
    } = modalMethods;
    const [isValidListname, setIsValidListname] = useState(false);

    // Only show when media type is checked
    if (!mediaTypeCode && !mediaTypeSnippet) {
        return null;
    }

    // Fetch offer snippets when "My template" tab is selected
    useEffect(() => {
        const fetchOfferSnippets = async () => {
            if (!departmentId || !clientId || !userId) return;

            setLoadingSnippets(true);
            try {
                const currentPayload = {
                    ...payload,
                    departmentId,
                    clientId,
                    userId,
                };
                const result = await dispatch(get_offersnippentLists(currentPayload));

                if (result?.status && result?.data) {
                    let rawSnippets = [];
                    let total = 0;

                    if (Array.isArray(result?.data)) {
                        rawSnippets = result?.data;
                        total = result?.data.length;
                    } else if (result?.data?.items && Array.isArray(result?.data.items)) {
                        rawSnippets = result?.data.items;
                        total = result?.data.totalRecords || result?.data.items.length;
                    } else if (result?.data?.data && Array.isArray(result?.data.data)) {
                        rawSnippets = result?.data.data;
                        total = result?.data.totalRecords || result?.data.data.length;
                    }

                    setTotalRecords(total || 0);

                    const mappedSnippets = rawSnippets.map((snippet) => {
                        // Get image URL from html or thumbnailPath (API returns URL in these fields)
                        let imageUrl = snippet.thumbnailPath || snippet.html || '';

                        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
                            imageUrl = imageUrl.replace(/(https?:\/\/)\/+/g, '$1');
                        }

                        const isImageUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');

                        let formattedThumbnail = '';
                        let formattedContentThumbnail = '';

                        if (imageUrl) {
                            if (isImageUrl) {
                                formattedThumbnail = imageUrl;
                                formattedContentThumbnail = '';
                            } else if (imageUrl.startsWith('data:')) {
                                formattedThumbnail = imageUrl;
                                formattedContentThumbnail = imageUrl;
                            } else {
                                formattedThumbnail = imageUrl;
                                formattedContentThumbnail = imageUrl;
                            }
                        }

                        // Properly constructed data for CardCommunication
                        return {
                            templateName: snippet.snippetName || snippet.templateName || '',
                            snippetName: snippet.snippetName || '',
                            thumbnailPath: formattedThumbnail,
                            contentThumbnail: formattedContentThumbnail,
                            html: snippet.html || snippet.thumbnailPath || '',
                            templateID: snippet.snippetID || snippet.templateID || snippet.snippetId || 0,
                            snippetID: snippet.snippetID || snippet.snippetId || 0,
                            createdDate: snippet.createdDate || snippet.createdOn || '',
                            templateCategoryID: snippet.templateCategoryID || snippet.templateCategoryId || 0,
                            emailhtml: snippet.html || snippet.thumbnailPath || '',
                            edmTemplateId: snippet.snippetID || snippet.templateID || 0,
                            // Store original image URL for DOM manipulation in SnippetTemplate
                            originalImageUrl: isImageUrl ? imageUrl : '',
                        };
                    });

                    setOfferSnippets(mappedSnippets);
                } else {
                    setOfferSnippets([]);
                    setTotalRecords(0);
                }
            } catch (error) {
                setOfferSnippets([]);
                setTotalRecords(0);
            } finally {
                setLoadingSnippets(false);
            }
        };

        if (selectedTemplateTab === 0) {
            fetchOfferSnippets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedTemplateTab,
        payload.pagination.pageNo,
        payload.pagination.recordLimit,
        payload.filteration.snippetName,
        payload.filteration.startDate,
        payload.filteration.endDate,
        departmentId,
        clientId,
        userId,
        dispatch,
        refreshCounter,
    ]);

    // Note: URL images are now handled directly in CardCommunication component
    // No DOM manipulation needed - URLs are passed via thumbnailPath

    // Handle snippet selection - fetch and load snippet data
    // Defined before useEffects to avoid "Cannot access before initialization" error
    const handleSnippetSelect = useCallback(async (snippetId, isAutoSelect = false) => {
        if (!snippetId) {
            return;
        }

        // If this is a manual selection (not auto-select), clear pending auto-select
        // And clear the reset ref so manual selection works even after a reset
        if (!isAutoSelect) {
            setPendingAutoSelectId(null);
            isResetRef.current = false;
        } else {
            // If auto-selecting but we are in reset mode, abort
            if (isResetRef.current) return;
        }

        const selectedSnippet = offerSnippets.find(
            (snippet) =>
                snippet.templateID === snippetId || snippet.snippetID === snippetId || snippet.snippetId === snippetId,
        );

        setLoadingSnippet(true);
        try {
            // Check again before API call
            if (isResetRef.current && isAutoSelect) {
                setLoadingSnippet(false);
                return;
            }

            // Fetch snippet data by ID
            const payload = {
                clientId,
                departmentId,
                userId,
                snippetId: snippetId,
            };

            const result = await dispatch(fetch_offersnippetById(payload, false, false));

            // final check after await
            if (isResetRef.current) return;

            if (result?.status && result?.data) {
                const snippetData = result?.data;
                // Get image URL from HTML or ThumbnailPath field (API returns image URL, not HTML)
                const snippetImageUrl =
                    snippetData.HTML ||
                    snippetData.ThumbnailPath ||
                    snippetData.html ||
                    snippetData.thumbnailPath ||
                    '';

                // Get JsonContent for template structure (stored as JSON string)
                const jsonContent = snippetData.JsonContent || snippetData.jsonContent || '';

                if (snippetImageUrl) {
                    setSnippetPreviewImage(snippetImageUrl);

                    // Store JsonContent for potential future use (e.g., editing in offer builder)
                    if (jsonContent) {
                        try {
                            const parsedJsonContent =
                                typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
                            // Store in a form field if needed for later use
                            setValue('snippetJsonContent', parsedJsonContent, {
                                shouldValidate: false,
                                shouldDirty: false,
                            });
                        } catch (parseError) { }
                    }

                    // Store snippet ID and name for reference
                    const snippetName =
                        snippetData.TemplateName ||
                        snippetData.templateName ||
                        selectedSnippet?.templateName ||
                        selectedSnippet?.snippetName ||
                        '';

                    setValue('selectedSnippetId', snippetId, { shouldValidate: false, shouldDirty: false });
                    setValue('selectedSnippetName', snippetName, { shouldValidate: false, shouldDirty: false });
                    setValue('offerSnippetId', snippetId, { shouldValidate: false, shouldDirty: false });
                    setValue('offerSnippetName', snippetName, { shouldValidate: false, shouldDirty: false });
                    setSelectedSnippetName(snippetName || 'Selected template');
                } else {
                    dispatch(
                        update_failures_API_Errors({
                            field: 'SnippetTemplate',
                            message: 'Snippet preview image not found',
                        }),
                    );
                }
            } else {
                dispatch(
                    update_failures_API_Errors({
                        field: 'SnippetTemplate',
                        message: result?.message || 'Failed to load snippet',
                    }),
                );
            }
        } catch (error) {
            dispatch(
                update_failures_API_Errors({
                    field: 'SnippetTemplate',
                    message: 'Error loading snippet',
                }),
            );
        } finally {
            setLoadingSnippet(false);
        }
    }, []);

    // Simple auto-select: Track when autoSelectSnippetId prop is provided
    useEffect(() => {
        // Only set pending if we have a valid snippetId and haven't already auto-selected it
        if (autoSelectSnippetId && autoSelectSnippetId !== hasAutoSelectedId && !snippetPreviewImage) {
            setPendingAutoSelectId(autoSelectSnippetId);
            setValue('selectedSnippetId', autoSelectSnippetId, { shouldValidate: false, shouldDirty: false });
            if (selectedTemplateTab === 0 && !loadingSnippets) {
                setPayload((prev) => ({
                    ...prev,
                    pagination: {
                        ...prev.pagination,
                        pageNo: 1, // Reset to first page to show newest snippets
                    },
                }));
            }
        }
    }, [
        autoSelectSnippetId,
        hasAutoSelectedId,
        hasManuallyReset,
        snippetPreviewImage,
        setValue,
        selectedTemplateTab,
        loadingSnippets,
    ]);

    // Auto-select when component becomes visible and we have a pending snippetId
    useEffect(() => {
        if (
            mediaTypeSnippet &&
            pendingAutoSelectId &&
            pendingAutoSelectId !== hasAutoSelectedId &&
            !loadingSnippet &&
            !loadingSnippets &&
            !snippetPreviewImage &&
            !hasManuallyReset
        ) {
            // Switch to "My template" tab if needed
            if (selectedTemplateTab !== 0) {
                setSelectedTemplateTab(0);
                return; // Let effect run again after tab switch
            }

            setHasAutoSelectedId(pendingAutoSelectId);
            handleSnippetSelect(pendingAutoSelectId, true);
        }
    }, [
        mediaTypeSnippet,
        pendingAutoSelectId,
        hasAutoSelectedId,
        hasManuallyReset,
        loadingSnippet,
        loadingSnippets,
        snippetPreviewImage,
        selectedTemplateTab,
        handleSnippetSelect,
    ]);

    // Also handle auto-select from form value (for edit mode)
    useEffect(() => {
        // If we have a selectedSnippetId from form (not from prop) and no preview, auto-select it
        if (
            selectedSnippetId &&
            selectedSnippetId !== autoSelectSnippetId && // Not from prop
            selectedSnippetId !== hasAutoSelectedId &&
            !snippetPreviewImage &&
            !loadingSnippet &&
            !loadingSnippets &&
            mediaTypeSnippet
        ) {
            if (selectedTemplateTab !== 0) {
                setSelectedTemplateTab(0);
                return;
            }
            setHasAutoSelectedId(selectedSnippetId);
            handleSnippetSelect(selectedSnippetId, true);
        }
    }, [
        selectedSnippetId,
        autoSelectSnippetId,
        hasAutoSelectedId,
        snippetPreviewImage,
        loadingSnippet,
        loadingSnippets,
        mediaTypeSnippet,
        selectedTemplateTab,
        handleSnippetSelect,
    ]);

    // Handle reset - clear snippet preview
    const handleResetSnippet = () => {
        isResetRef.current = true;
        setSnippetPreviewImage('');
        setSelectedSnippetName('');
        setValue('selectedSnippetId', '', { shouldValidate: false, shouldDirty: false });
        setValue('selectedSnippetName', '', { shouldValidate: false, shouldDirty: false });
        setValue('offerSnippetId', '', { shouldValidate: false, shouldDirty: false });
        setValue('offerSnippetName', '', { shouldValidate: false, shouldDirty: false });
        setValue('snippetJsonContent', '', { shouldValidate: false, shouldDirty: false });

        // Clear auto-select state - this prevents re-auto-selection
        setPendingAutoSelectId(null);
        setHasAutoSelectedId(null);

        // Clear URL parameter to prevent re-triggering auto-select
        try {
            const searchParams = new URLSearchParams(location.search);
            const qParam = searchParams.get('q');

            if (qParam) {
                try {
                    const decoded = decodeLargeState(qParam);

                    if (decoded && decoded.snippetId) {
                        const { snippetId, ...rest } = decoded;
                        const newStateObj = rest;

                        if (Object.keys(newStateObj).length > 0) {
                            const newQParam = encodeUrl(newStateObj);
                            navigate(`${location.pathname}?q=${newQParam}${location.hash || ''}`, { replace: true });
                        } else {
                            navigate(location.pathname + (location.hash || ''), { replace: true });
                        }
                    }
                } catch (decodeError) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('snippetId');
                    navigate(url.pathname + url.search + (url.hash || ''), { replace: true });
                }
            } else {
                const url = new URL(window.location.href);
                if (url.searchParams.has('snippetId')) {
                    url.searchParams.delete('snippetId');
                    navigate(url.pathname + url.search + (url.hash || ''), { replace: true });
                }
            }
        } catch (error) { }
    };

    // Handle search
    const handleSearch = (filterValue) => {
        setPayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                snippetName: filterValue,
                startDate: pre?.filteration?.startDate,
                endDate: pre?.filteration?.endDate,
            },
            pagination: {
                pageNo: 1,
                recordLimit: 6,
            },
        }));
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: 6,
        }));
    };

    // Handle date picker change
    const handleDatePickerChange = ({ startDate, endDate }) => {
        setPayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                snippetName: pre?.filteration?.snippetName,
                startDate: getYYMMDD(startDate),
                endDate: getYYMMDD(endDate),
            },
            pagination: {
                pageNo: 1,
                recordLimit: 6,
            },
        }));
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: 6,
        }));
        setDates({
            startDate,
            endDate,
            selectedDateText: `${getYYMMDD(startDate)} - ${getYYMMDD(endDate)}`,
        });
    };

    // Handle template modal save - validate and proceed with navigation
    const handleModalSave = async (data) => {
        if (data.offerName !== '' && isValidListname) {
            const snippetTemplateName = getModalValues('offerName');

            await proceedWithNavigation(snippetTemplateName);
            setShowTemplateModal(false);
            clearModalErrors();
            setModalValue('offerName', '');
            setIsValidListname(false);
        } else {
            modalMethods.trigger();
        }
    };

    // Proceed with navigation after modal validation - save offer first, then navigate
    // snippetTemplateNameFromModal = "Offer Snippet Name" only; must not overwrite CRM offer name / TEXT_OFFER_CODE label
    const proceedWithNavigation = async (snippetTemplateNameFromModal) => {
        const allValues = getValues();
        const snippetdata = pendingNavigation?.snippetdata;
        const currentOfferName = watch('offerName') || '';

        const trimStr = (v) => (typeof v === 'string' ? v.trim() : '');
        const mainOfferName =
            trimStr(currentOfferName) ||
            trimStr(allValues?.offerName) ||
            '';

        const offerSnippetId = allValues.selectedSnippetId || null;
        const offerSnippetName = allValues.selectedSnippetName || null;

        const offerData = {
            ...allValues,
            offerName: mainOfferName,
            offerSnippetId: offerSnippetId,
            offerSnippetName: offerSnippetName,
        };

        const onSuccess = (offerIdNumber) => {
            const returnSearch = new URLSearchParams();
            returnSearch.set('offerId', String(offerIdNumber));
            if (getIsEdit) {
                returnSearch.set('isEdit', String(getIsEdit === true ? 1 : getIsEdit));
            }
            const fromEnviWithOfferId = `/preferences/create-offer?${returnSearch.toString()}`;

            const offerNameForBuilderAndCode = mainOfferName || 'Offer snippet';
            const snippetTemplateLabel = trimStr(snippetTemplateNameFromModal) || offerNameForBuilderAndCode;

            // Use the data currently in the form for the builder state
            const stateAIBuilder = {
                mode: 'add',
                templateName: snippetTemplateLabel,
                offerName: mainOfferName,
                offerdetails: offerData,
                offerDisplay: watch('display') || '',
                codeType: watch('offerCodeType') || '',
                offerBuilderEnabled: true,
                offerId: offerIdNumber,
                from: 'Offer',
                campaignId: 0,
                channelId: 1,
                templateId: 0,
                channelDetailId: 0,
                edmChannelId: 0,
                departmentId,
                clientId,
                userId,
                fromEnvi: fromEnviWithOfferId,
                templateCategoryType: {
                    categoryName: 'Business',
                    templateCategoryId: 2,
                },
                resolution: snippetdata?.size || '',
            };

            const encryptState = encodeUrl(stateAIBuilder);
            navigate(`/preferences/template-gallery/offer-builder?q=${encryptState}&mode=${stateAIBuilder.mode}`, {
                state: stateAIBuilder,
            });
            setPendingNavigation(null);
        };

        // Trigger the shared handleSave logic
        handleSave(offerData, false, { onSuccess });
    };

    const handleOfferNavigation = async (snippetdata) => {
        // Validate all parent (CreateOffer) form fields before opening snippet name modal
        const isFormValid = await trigger();
        if (!isFormValid) {
            // Scroll to top where the error occurs
            window.scrollTo({
                top: 200,
                behavior: 'smooth',
            });
            return;
        }
        setPendingNavigation({ snippetdata });
        setModalValue('offerName', '');
        clearModalErrors();
        setIsValidListname(false);
        setShowTemplateModal(true);
        setTimeout(() => {
            setModalFocus('offerName');
        }, 200);
    };

    const handleOptionSelect = async (action, snippet) => {
        if (action === 'Edit') {
            const snippetId = snippet.templateID || snippet.snippetID || snippet.snippetId;
            if (!snippetId) return;

            setLoadingSnippet(true);
            try {
                const fetchPayload = {
                    clientId,
                    departmentId,
                    userId,
                    snippetId: snippetId,
                };
                const result = await dispatch(fetch_offersnippetById(fetchPayload, true, false));
                if (result?.status && result?.data) {
                    const snippetData = result?.data;
                    const jsonContent = snippetData.JsonContent || snippetData.jsonContent || '';

                    let resolutionSize = '';
                    try {
                        const parsedData = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
                        const canvasStyle = parsedData?.settings?.style || parsedData?.display || {};

                        if (canvasStyle?.emailWidth) {
                            resolutionSize = `${canvasStyle.emailWidth}x${canvasStyle.emailHeight || canvasStyle.emailWidth}`;
                        } else if (snippetData?.Resolution || snippetData?.resolution) {
                            resolutionSize = snippetData.Resolution || snippetData.resolution;
                        } else if (parsedData?.resolution) {
                            resolutionSize = parsedData.resolution;
                        }
                    } catch (e) { }

                    const trimStrEdit = (v) => (typeof v === 'string' ? v.trim() : '');
                    const mainOfferNameForEdit =
                        trimStrEdit(watch('offerName')) ||
                        trimStrEdit(getValues('offerName')) ||
                        '';

                    const stateAIBuilder = {
                        data: typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent),
                        templateId: snippetId,
                        mode: 'edit',
                        is5_0: true,
                        templateName:
                            snippet.templateName ||
                            snippet.snippetName ||
                            snippetData.TemplateName ||
                            snippetData.templateName ||
                            '',
                        offerName: mainOfferNameForEdit,
                        offerdetails: getValues(),
                        from: 'Offer',
                        offerId: currentOfferId,
                        departmentId,
                        clientId,
                        userId,
                        fromEnvi: location.pathname + location.search,
                        templateCategoryType: {
                            categoryName: 'Business',
                            templateCategoryId: 2,
                        },
                        resolution: resolutionSize,
                    };

                    const onSuccess = (savedOfferId) => {
                        const returnSearch = new URLSearchParams();
                        returnSearch.set('offerId', String(savedOfferId));
                        if (getIsEdit) {
                            returnSearch.set('isEdit', String(getIsEdit === true ? 1 : getIsEdit));
                        }
                        const fromEnviWithOfferId = `/preferences/create-offer?${returnSearch.toString()}`;

                        stateAIBuilder.offerId = savedOfferId;
                        stateAIBuilder.fromEnvi = fromEnviWithOfferId;

                        const encryptState = encodeUrl(stateAIBuilder);
                        navigate(`/preferences/template-gallery/offer-builder?q=${encryptState}&mode=edit`, {
                            state: stateAIBuilder,
                        });
                    };

                    // Trigger the shared handleSave logic before navigating to edit in builder
                    handleSave(getValues(), false, { onSuccess });
                }
            } finally {
                setLoadingSnippet(false);
            }
        } else if (action === 'Delete') {
            const snippetId = snippet.templateID || snippet.snippetID || snippet.snippetId;
            if (!snippetId) return;

            setSnippetToDelete(snippetId);
            setShowDeleteModal(true);
        }
    };

    const handleConfirmDelete = async (status) => {
        if (status && snippetToDelete) {
            const deletePayload = {
                clientId,
                departmentId,
                userId,
                snippetId: snippetToDelete,
            };

            const result = await deleteApi.refetch({
                fetcher: () => dispatch(delete_offersnippetById(deletePayload, false)),
                loaderConfig: fieldLoaderConfig,
                mode: 'create',
            });
            if (result?.status) {
                setShowDeleteModal(false);
                setLoadingSnippets(true);
                setPayload((pre) => ({
                    ...pre,
                    pagination: {
                        pageNo: 1,
                        recordLimit: 6,
                    },
                }));
                setRefreshCounter((prev) => prev + 1);
                setSnippetToDelete(null);
            }
        } else if (!isDeleteLoading) {
            setShowDeleteModal(false);
            setSnippetToDelete(null);
        }
    };

    return (
        <>
            <RSConfirmationModal
                show={showDeleteModal}
                handleClose={() => {
                    if (isDeleteLoading) return;
                    setShowDeleteModal(false);
                    setSnippetToDelete(null);
                }}
                handleConfirm={handleConfirmDelete}
                isCloseButton={true}
                isBorder
                isLoading={isDeleteLoading}
                blockBodyPointerEvents
            />
            {/* Template Name Modal */}
            <FormProvider {...modalMethods}>
                <RSModal
                    show={showTemplateModal}
                    size="md"
                    header={'Offer Snippet Name'}
                    handleClose={() => {
                        if (isSaveLoading) return;
                        setModalValue('offerName', '');
                        clearModalErrors();
                        setIsValidListname(false);
                        setShowTemplateModal(false);
                        setPendingNavigation(null);
                    }}
                    isCloseButton={true}
                    body={
                        <form className="page-content-holder">
                            <div className="page-content-holder">
                                <div className="form-group mb0">
                                    <ListNameExists
                                        name="offerName"
                                        field="snippetName"
                                        maxLength={MAX_LENGTH}
                                        apiCallback={get_offersnippentNameExist}
                                        onValid={(valid) => setIsValidListname(valid)}
                                        condition={({ status }) => {
                                            return !status;
                                        }}
                                        placeholder={'Offer Snippet Name'}
                                        rules={LIST_NAME_RULES('Offer Snippet Name')}
                                        customErrorMessage={'Offer Snippet Name'}
                                    />
                                </div>
                            </div>
                        </form>
                    }
                    footer={
                        <>
                            <RSSecondaryButton
                                blockInteraction={isSaveLoading}
                                onMouseDown={() => {
                                    if (isSaveLoading) return;
                                    setModalValue('offerName', '');
                                    clearModalErrors();
                                    setIsValidListname(false);
                                    setShowTemplateModal(false);
                                    setPendingNavigation(null);
                                }}
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                onClick={handleModalSubmit(handleModalSave)}
                                className={isValidListname ? '' : 'click-off'}
                                isLoading={isSaveLoading}
                                blockBodyPointerEvents={isSaveLoading}
                            >
                                {SAVE}
                            </RSPrimaryButton>
                        </>
                    }
                />
            </FormProvider>

            <div className={`form-group create-offer-grid-view ${snippetPreviewImage ? 'snippet' : ''} mb0`}>
                <Row>
                    <Col sm={snippetPreviewImage ? { offset: 2, span: 8 } : 12}>
                        {snippetPreviewImage ? (
                            <div className="offer-snippet-container">
                                <div className="d-flex justify-content-between align-items-center selected-template-header border-bottom p-2 px21">
                                    <div>
                                        <h5 className="mb0">{selectedSnippetName || 'Offer template'}</h5>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <RSTooltip
                                            text="Edit template"
                                            className="mb-5 mr15"
                                            position="top"
                                            innerContent={false}
                                        >
                                            <i
                                                onClick={() => {
                                                    handleOptionSelect('Edit', { snippetId: selectedSnippetId });
                                                }}
                                                className={`${form_edit_medium} icon-md color-primary-blue pointer`}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </RSTooltip>
                                        <RSTooltip text="Reset" className="mb-5" position="top" innerContent={false}>
                                            <i
                                                onClick={handleResetSnippet}
                                                className={`${restart_medium} icon-md color-primary-blue pointer`}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </RSTooltip>
                                    </div>
                                </div>
                                <div className="form-group mt20">
                                    <Row>
                                        <Col sm={12}>
                                            <div
                                                id="offer-snippet-preview"
                                                className="edm-import-wrapper EDM-template-preview thumb w-100 mb21"
                                                ref={previewContainerRef}
                                            >
                                                {(() => {
                                                    let content = snippetPreviewImage;

                                                    // Helper to inject CSS for proper display (from EmailBuilder gallery)
                                                    const socialFixCss = `
                                                        <style>
                                                            table.main-column.social-table td { font-size: 0 !important; }
                                                            table.main-column.social-table td table.pc-w620-width-auto {
                                                                display: inline-block !important;
                                                                width: auto !important;
                                                                vertical-align: middle !important;
                                                            }
                                                            a, button, input, textarea, select, img {
                                                                pointer-events: none !important;
                                                                cursor: default !important;
                                                            }
                                                        </style>
                                                    `;

                                                    const injectCss = (html) => {
                                                        if (!html) return '';
                                                        if (html.includes('</head>'))
                                                            return html.replace('</head>', `${socialFixCss}</head>`);
                                                        return `${socialFixCss}${html}`;
                                                    };

                                                    // Try to parse if it's a stringified JSON string
                                                    if (typeof content === 'string' && content.trim()) {
                                                        const trimmed = content.trim();
                                                        if (
                                                            trimmed.startsWith('{') ||
                                                            trimmed.startsWith('[') ||
                                                            (trimmed.startsWith('"') && trimmed.endsWith('"'))
                                                        ) {
                                                            try {
                                                                const parsed = JSON.parse(trimmed);
                                                                if (typeof parsed === 'string') {
                                                                    content = parsed;
                                                                }
                                                            } catch (e) {
                                                                // If parsing fails, use original content
                                                            }
                                                        }
                                                    }

                                                    const isHtml =
                                                        typeof content === 'string' && content.trim().startsWith('<');

                                                    if (isHtml) {
                                                        return (
                                                            <div
                                                                className="iframe-container"
                                                                style={{
                                                                    minHeight: '150px',
                                                                    overflow: 'hidden',
                                                                    position: 'relative',
                                                                }}
                                                            >
                                                                <iframe
                                                                    srcDoc={injectCss(content)}
                                                                    title="Offer Preview"
                                                                    className="email-preview-iframe"
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        border: 'none',
                                                                        pointerEvents: 'none',
                                                                    }}
                                                                    tabIndex={-1}
                                                                    onLoad={(e) => {
                                                                        try {
                                                                            const iframe = e.target;
                                                                            // Logic adapted from Template.jsx handleFileInputChange
                                                                            const htmlNode =
                                                                                iframe.contentDocument?.children?.[0];
                                                                            const bodyNode = Array.from(
                                                                                htmlNode?.childNodes || [],
                                                                            ).find(
                                                                                (node) =>
                                                                                    node.nodeType === 1 &&
                                                                                    node.nodeName.toLowerCase() ===
                                                                                    'body',
                                                                            );
                                                                            const clientHeight =
                                                                                bodyNode?.offsetHeight ||
                                                                                bodyNode?.scrollHeight ||
                                                                                iframe.contentWindow?.document?.body
                                                                                    ?.scrollHeight;

                                                                            if (clientHeight && iframe.parentNode) {
                                                                                iframe.parentNode.style.height = `${clientHeight + 20
                                                                                    }px`; // +20 for some padding
                                                                                iframe.style.height = `${clientHeight + 20
                                                                                    }px`;
                                                                            }
                                                                        } catch (err) { }
                                                                    }}
                                                                />
                                                                {/* Overlay to prevent interaction */}
                                                                <div
                                                                    className="absolute inset-0 z-10"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        right: 0,
                                                                        bottom: 0,
                                                                        zIndex: 10,
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <img
                                                                src={content}
                                                                alt="Snippet Preview"
                                                                style={{
                                                                    width: '100%',
                                                                    height: 'auto',
                                                                    objectFit: 'contain',
                                                                    display: 'block',
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const errorDiv = document.createElement('div');
                                                                    errorDiv.textContent =
                                                                        'Failed to load preview image';
                                                                    errorDiv.style.cssText =
                                                                        'color: #999; text-align: center; padding: 20px;';
                                                                    // Check if parentNode exists before appending
                                                                    if (e.target.parentNode) {
                                                                        e.target.parentNode.appendChild(errorDiv);
                                                                    }
                                                                }}
                                                                onLoad={() => { }}
                                                            />
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        ) : (
                            <RSTabbar
                                dynamicTab="rs-tabs row rst-left-space mb0 mini "
                                activeClass="active"
                                tabData={[
                                    {
                                        id: 0,
                                        text: 'My template',
                                        component: () => (
                                            <>
                                                <div className="flex-row justify-content-end my21 top-sub-heading">
                                                    <ul className="rs-list-group-horizontal">
                                                        <li>
                                                            <RSDateRangePicker
                                                                onDatePickerClosed={handleDatePickerChange}
                                                                startDate={dates?.startDate}
                                                                endDate={dates?.endDate}
                                                                selectedDateText={dates?.selectedDateText}
                                                                isTemplate
                                                            />
                                                        </li>
                                                        <li>
                                                            <RSSearchField
                                                                searchedText={handleSearch}
                                                                placeholder={'By template name'}
                                                                isCloseSearch={isCloseSearch}
                                                                setIsCloseSearch={setIsCloseSearch}
                                                                setsearchDiv={setSearchDiv}
                                                                isActiveClass="email-template"
                                                            />
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* Template Grid */}
                                                <div className="form-group mt20">
                                                    <Row>
                                                        {loadingSnippets || loadingSnippet ? (
                                                            <Col sm={12}>
                                                                <SnippetTemplateSkeleton
                                                                    isError={!loadingSnippets && !loadingSnippet}
                                                                />
                                                            </Col>
                                                        ) : offerSnippets?.length > 0 ? (
                                                            offerSnippets.map((snippet, index) => (
                                                                <CardCommunication
                                                                    key={index}
                                                                    list={snippet}
                                                                    from="offer"
                                                                    onSelect={handleSnippetSelect}
                                                                    onOptionSelect={handleOptionSelect}
                                                                    showOptions={true}
                                                                    col={4}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Col sm={12}>
                                                                <div className="box-design">
                                                                    <HorizontalSkeleton isError={true} />
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>

                                                {/* Pagination */}
                                                {totalRecords > 6 && (
                                                    <RSPager
                                                        isGallery={true}
                                                        data={offerSnippets}
                                                        totalRow={totalRecords}
                                                        change={(data, skip, take) => {
                                                            const size = skip === 0 ? 1 : skip / take + 1;
                                                            setPayload((pre) => ({
                                                                ...pre,
                                                                pagination: {
                                                                    pageNo: size,
                                                                    recordLimit: take,
                                                                },
                                                            }));
                                                        }}
                                                        config={pagerPageConfig}
                                                    />
                                                )}
                                            </>
                                        ),
                                    },
                                    {
                                        id: 1,
                                        text: 'Predefined template',
                                        component: () => (
                                            <div className="form-group mt20">
                                                <Row>
                                                    <Col md={12}>
                                                        <div
                                                            className="temp-grid-wrapper"
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns:
                                                                    'repeat(auto-fill, minmax(150px, 1fr))',
                                                                gap: '10px',
                                                            }}
                                                        >
                                                            {ImageSettingCommonResolution?.map((resolution, index) => {
                                                                const [width, height] = resolution?.size
                                                                    ?.split('x')
                                                                    .map(Number);
                                                                const SCALE_FACTOR = 0.2;
                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        style={{
                                                                            border:
                                                                                selectedResolution?.size ===
                                                                                    resolution?.size
                                                                                    ? '1px solid #0000ff'
                                                                                    : '1px solid #c2cfe3',
                                                                            padding: '10px',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                        }}
                                                                        onClick={() => {
                                                                            setSelectedResolution(resolution);
                                                                            handleOfferNavigation(resolution);
                                                                        }}
                                                                        className="temp-grid-box cp"
                                                                    >
                                                                        <div
                                                                            className="temp-card"
                                                                            style={{
                                                                                width: `${width * SCALE_FACTOR}px`,
                                                                                height: `${height * SCALE_FACTOR}px`,
                                                                                backgroundColor: '#e0e0e0',
                                                                                margin: '0 auto 10px',
                                                                                border: '1px solid #ccc',
                                                                            }}
                                                                        />
                                                                        <p
                                                                            style={{
                                                                                margin: 0,
                                                                                textAlign: 'center',
                                                                                fontSize: '12px',
                                                                            }}
                                                                        >
                                                                            {resolution.label} <br /> {resolution.size}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ),
                                    },
                                ]}
                                defaultClass="col-sm-6"
                                callBack={(value) => setSelectedTemplateTab(value.id)}
                            />
                        )}
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default SnippetTemplate;
