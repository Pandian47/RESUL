import { convertToUserTimezone, convertUTCtoUserTimezone, getDateFormat, getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ADD_FIRST_COMMUNICATION_1, ADD_FIRST_COMMUNICATION_2, ALERT, COMPLETED, IN_PROGRESS, SCHEDULED, SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_plus_fill_edge_large, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Row } from 'react-bootstrap';
import { cloneDeep, get as _get, isEqual } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchDropdownDataCommunicationList } from 'Reducers/communication/listing/request';

import { ResTemplateCard } from '../Card';
import RSPager from 'Components/RSPager';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { getGalleryList, getInfoList } from 'Reducers/communication/gallery/request';
import useApiLoader from 'Hooks/useApiLoader';

import { CHANNELSSOCIAL_LIST } from 'Constants/GlobalConstant/channelSocialList';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { consumeCommunicationRouteSkeleton } from 'Components/Skeleton/pages/communication/communicationRouteSkeletonPhase';
import GalleryTabSkeleton from 'Components/Skeleton/pages/communication/gallery/GalleryTabSkeleton';
import { INITIAL_GALLERY_CONFIG } from 'Components/RSPager/constant';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS } from 'Constants/AdvanceSearch';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { updateGallery } from 'Reducers/communication/gallery/reducer';
import usePermission from 'Hooks/usePersmission';

import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import SkeletonGalleryCard from 'Components/Skeleton/Components/SkeletonGalleryCard.jsx';
import RSAdvanceSearchNew, {
    buildAdvanceSearchPersistStorageKey,
    hasPersistedAdvanceFilters,
    isEntireMultiSelectChosen,
    resolveMyCommunicationsScopeFromStorage,
} from 'Components/AdvanceSearchNew';
import {
    fetchCommunicationListingFilterOptionResponses,
    mapFilterResponsesToOptionsState,
} from 'Pages/AuthenticationModule/Communication/CommunicationLists/loadCommunicationListingFilterOptions';
import {
    buildGalleryAdvanceFilterConfig,
    buildGalleryFiltersPayload,
    GALLERY_CHANNEL_FILTER_DATA,
    GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER,
    GALLERY_DEFAULT_EMAIL_CHANNEL_ROW,
    GALLERY_INITIAL_OPTIONS_FOR_PAYLOAD,
    mergeGalleryActiveFiltersFromPersistedStorage,
    resolveGalleryChannelIdsFromAdvanceFilters,
} from './constant';

/** Name suggestions (same API as communication listing). */
const GALLERY_NAME_SUGGEST_DEBOUNCE_MS = 400;
const GALLERY_NAME_SUGGEST_MIN_CHARS = 3;
const GALLERY_ADVANCE_SEARCH_OPTIONS = ['Communication name', 'Communication type', 'Delivery type'];

/** Same scope labels as Communication List toolbar (My / All). */
const GALLERY_SCOPE_DROPDOWN_DATA = ['All communications', 'My communications','Golden communications'];
const GALLERY_TOP_CHANNEL_DROPDOWN_DATA = GALLERY_CHANNEL_FILTER_DATA;

/** Chip-row omit keys (parity with `RSAdvanceSearchNew` when we pass `excludeActiveFilterTagKeys`). */
const GALLERY_EXCLUDE_ACTIVE_FILTER_CHIP_KEYS = [
    'channel_type',
    ...COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS,
];

/** Gallery API: only social post (7) and paid media (10) use subChannelId; all others must send 0. */
const GALLERY_CHANNEL_IDS_USING_SUBCHANNEL = [7, 10];

const resolveGalleryPayloadSubChannelId = (channelRow) => {
    if (!channelRow) return 0;
    const id = Number(channelRow.id);
    if (GALLERY_CHANNEL_IDS_USING_SUBCHANNEL.includes(id)) {
        return channelRow.subChannelId ?? 0;
    }
    return 0;
};

const CommunicationGallery = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { control, setValue } = useForm({
        defaultValues: { channels: GALLERY_DEFAULT_EMAIL_CHANNEL_ROW },
    });
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const { licenseTypeId, isAgency, isCampaign } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state) ?? {});
    const utcTimeData = useSelector((state) => getUtcTimeData(state) ?? {});
    const { galleryData, isLoading, isFailure } = useSelector(({ galleryReducer = {} }) => galleryReducer);
    const galleryList = galleryData?.items || [];
    const isFirstRender = useRef(true);
    const skipGallerySkeletonRef = useRef(consumeCommunicationRouteSkeleton());
    /** Skip duplicate `GetCampaignGalleryList` when `payload` updates twice on mount (e.g. advance search persist sync). */
    const lastGalleryListRequestRef = useRef(null);
    const { failureApiErrors = [] } = useSelector(({ globalstate = {} }) => globalstate);
    const { accountAdmin, company_clientId } = useSelector(({ globalstate = {} }) => globalstate);
    const isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;

    const galleryListAPI = useApiLoader({ actionCreator: getGalleryList });
    const galleryInfoAPI = useApiLoader({ actionCreator: getInfoList });
    const nameSuggestAPI = useApiLoader({ actionCreator: getSearchDropdownDataCommunicationList });

    const communicationOptions = useSelector(
        (state) => state.communicationPlanReducer?.communicationOptions ?? {},
    );
    const planDropdownsFetchedFor = useSelector(
        (state) => state.communicationPlanReducer?.planDropdownsFetchedFor ?? null,
    );
    const planDropdownCacheRef = useRef({ communicationOptions, planDropdownsFetchedFor });
    planDropdownCacheRef.current = { communicationOptions, planDropdownsFetchedFor };

    const currentUTCdateTime = utcTimeData?.utcTime
        ? new Date(utcTimeData.utcTime.replace('Z', ''))
        : new Date();

    const getTimezoneAdjustedStartDate = () => {
        let baseDate;
        if (utcTimeData?.utcTime) {
            baseDate = new Date(currentUTCdateTime);
            baseDate.setDate(baseDate.getDate() + LAST30DAYS_DATEFILTER);
        } else {
            baseDate = new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER));
        }
        if (utcTimeData?.utcTime) {
            return convertUTCtoUserTimezone(baseDate);
        }
        return convertToUserTimezone(baseDate, { formatAsString: false });
    };

    const getTimezoneAdjustedEndDate = () => {
        if (utcTimeData?.utcTime) {
            return convertUTCtoUserTimezone(currentUTCdateTime);
        }
        return convertToUserTimezone(new Date(), { formatAsString: false });
    };

    const [pagerPageConfig, setPagerPageConfig] = useState(INITIAL_GALLERY_CONFIG);
    const [getPaginationData, setGetPaginationData] = useState(null);

    const [payload, setPayload] = useState(() => {
        const seedFilters = mergeGalleryActiveFiltersFromPersistedStorage(clientId, userId, departmentId);
        const ch = seedFilters.channel_type?.rawValue;
        const initialGalleryChannelId = ch?.id ?? 1;
        const initialGallerySubChannelId = resolveGalleryPayloadSubChannelId(ch);
        return {
            clientId,
            userId,
            departmentId,
            channelId: initialGalleryChannelId,
            subChannelId: initialGallerySubChannelId,
            isFilter: true,
            isadvanceFilter: true,
            filteration: {
                ...buildGalleryFiltersPayload(
                    seedFilters,
                    undefined,
                    buildGalleryAdvanceFilterConfig(GALLERY_INITIAL_OPTIONS_FOR_PAYLOAD, userId),
                    {
                        myCommunicationsOnly: false,
                        userId,
                    },
                ),
                campaignName: '',
                startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
                departmentId,
            },
            pagination: {
                pageNo: 1,
                pageSize: 4,
            },
        };
    });

    const galleryChannelLabel = useMemo(() => {
        const pid = Number(payload.channelId);
        const sub = Number(payload.subChannelId);
        const hit = CHANNELSSOCIAL_LIST.find((c) => {
            if (Number(c.id) !== pid) return false;
            if (pid === 7 || pid === 10) {
                return Number(c.subChannelId) === sub;
            }
            return true;
        });
        return hit?.lable?.trim() || 'Email';
    }, [payload.channelId, payload.subChannelId]);

    useEffect(() => {
        const pid = Number(payload.channelId);
        const sub = Number(payload.subChannelId);
        const selectedRow =
            (CHANNELSSOCIAL_LIST || []).find((row) => {
                if (Number(row?.id) !== pid) return false;
                if (pid === 7 || pid === 10) {
                    return Number(row?.subChannelId ?? 0) === sub;
                }
                return true;
            }) || GALLERY_DEFAULT_EMAIL_CHANNEL_ROW;
        setValue('channels', selectedRow);
    }, [payload.channelId, payload.subChannelId, setValue]);

    const [searchDate, setSearchDate] = useState({});
    const [searchText, setSearchText] = useState('');
    const nameSuggestDebounceRef = useRef(null);
    const nameSuggestGenRef = useRef(0);
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [nameSuggestLoading, setNameSuggestLoading] = useState(false);
    const [searchValueSync, setSearchValueSync] = useState({ rev: 0, value: '' });
    const [currentFilters, setCurrentFilters] = useState(() =>
        mergeGalleryActiveFiltersFromPersistedStorage(clientId, userId, departmentId),
    );
    const galleryActiveFiltersRestoreOnSearchClose = useMemo(
        () => ({
            ...GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER,
            ...currentFilters,
        }),
        [currentFilters],
    );
    const galleryInitialActiveFilters = useMemo(
        () => ({
            ...GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER,
            channel_type: currentFilters.channel_type || GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER.channel_type,
        }),
        [currentFilters.channel_type],
    );
    const [myCommunicationsOnly, setMyCommunicationsOnly] = useState(false);
    const myCommunicationsOnlyRef = useRef(false);
    const handleMyCommunicationsToggleRef = useRef(() => {});
    const advanceFilterConfigRef = useRef([]);
    const [options, setOptions] = useState({
        productType: [],
        communicationType: [],
        tags: [],
        users: [],
    });

    const persistGalleryFiltersKey = useMemo(
        () => buildAdvanceSearchPersistStorageKey('comm-gallery', clientId, userId, departmentId),
        [clientId, userId, departmentId],
    );
    /** Defer first list fetch until `RSAdvanceSearchNew` hydrates persisted filters (avoids channelId 1 + double call). */
    const skipGalleryListUntilAdvanceHydrateRef = useRef(
        hasPersistedAdvanceFilters(persistGalleryFiltersKey),
    );
    const persistGalleryMyCommKey = useMemo(
        () => `${persistGalleryFiltersKey}:my-comm`,
        [persistGalleryFiltersKey],
    );
    /**
     * Bump only when the top channel Kendo changes so `RSAdvanceSearchNew` remounts from persisted filters.
     * Do not tie the key to `payload.channelId` — advanced panel channel picks update payload and would remount
     * (closing the panel + refiring the gallery list).
     */
    const [advanceSearchRemountKey, setAdvanceSearchRemountKey] = useState(0);

    const syncMyCommunicationsScopeFromStorage = useCallback(() => {
        const next = resolveMyCommunicationsScopeFromStorage({
            persistFiltersStorageKey: persistGalleryFiltersKey,
            persistMyCommScopeKey: persistGalleryMyCommKey,
            fallbackFromRef: myCommunicationsOnlyRef.current,
        });
        if (next !== myCommunicationsOnlyRef.current) {
            myCommunicationsOnlyRef.current = next;
            setMyCommunicationsOnly(next);
        }
        return next;
    }, [persistGalleryFiltersKey, persistGalleryMyCommKey]);

    useLayoutEffect(() => {
        if (!clientId || departmentId == null) return;
        try {
            const rawMyComm = localStorage.getItem(persistGalleryMyCommKey);
            if (rawMyComm === 'true' || rawMyComm === 'false') {
                const v = rawMyComm === 'true';
                setMyCommunicationsOnly(v);
                myCommunicationsOnlyRef.current = v;
                return;
            }
            setMyCommunicationsOnly(false);
            myCommunicationsOnlyRef.current = false;
            setMyCommunicationsOnly(false);
            myCommunicationsOnlyRef.current = false;
        } catch {
            /* ignore */
        }
    }, [persistGalleryFiltersKey, persistGalleryMyCommKey, clientId, departmentId]);

    useEffect(() => {
        if (clientId == null || departmentId == null) return;
        try {
            localStorage.setItem(persistGalleryMyCommKey, String(myCommunicationsOnly));
        } catch {
            /* ignore */
        }
    }, [myCommunicationsOnly, persistGalleryMyCommKey, clientId, departmentId]);

    const requestPayloadRef = useRef(payload);
    const searchDateRef = useRef(searchDate);
    const searchTextRef = useRef(searchText);
    const currentFiltersRef = useRef(currentFilters);

    useEffect(() => { requestPayloadRef.current = payload; }, [payload]);
    useEffect(() => { searchDateRef.current = searchDate; }, [searchDate]);
    useEffect(() => { searchTextRef.current = searchText; }, [searchText]);
    useEffect(() => { currentFiltersRef.current = currentFilters; }, [currentFilters]);
    useEffect(() => {
        myCommunicationsOnlyRef.current = myCommunicationsOnly;
    }, [myCommunicationsOnly]);

    useEffect(() => {
        const fetchProducts = async () => {
            const scope = { clientId, userId, departmentId };
            const { communicationOptions: co, planDropdownsFetchedFor: pf } = planDropdownCacheRef.current;
            const responses = await fetchCommunicationListingFilterOptionResponses(dispatch, scope, {
                communicationOptions: co,
                planDropdownsFetchedFor: pf,
            });
            setOptions(mapFilterResponsesToOptionsState(responses, { dedupeUsers: false }));
        };
        fetchProducts();
    }, [clientId, userId, departmentId, dispatch]);

    useEffect(
        () => () => {
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
                nameSuggestDebounceRef.current = null;
            }
        },
        [],
    );

    const fetchGalleryNameSuggestions = useCallback(
        async (text, armGen) => {
            const trimmed = String(text ?? '').trim();
            if (trimmed.length < GALLERY_NAME_SUGGEST_MIN_CHARS) {
                nameSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                return;
            }
            if (armGen !== nameSuggestGenRef.current) {
                return;
            }
            setNameSuggestLoading(true);
            const { timeZoneId } = getDateFormat();
            const filters = currentFiltersRef.current || {};
            const { channelId, subChannelId } = resolveGalleryChannelIdsFromAdvanceFilters(filters);
            const searchPayload = {
                clientId,
                userId: 0,
                departmentId,
                channelId,
                subChannelId,
                searchText: trimmed,
                searchType: 'CommunicationList',
                startDate: searchDateRef.current?.startDate ?? getYYMMDD(getTimezoneAdjustedStartDate()),
                endDate: searchDateRef.current?.endDate ?? getYYMMDD(getTimezoneAdjustedEndDate()),
                timezoneid: timeZoneId ?? 0,
            };
            try {
                const response = await nameSuggestAPI.refetch({
                    payload: searchPayload,
                    loading: false,
                });
                if (armGen !== nameSuggestGenRef.current) return;
                if (response?.status && response?.data != null) {
                    const raw = response?.data;
                    let parsed = [];
                    try {
                        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    } catch {
                        parsed = [];
                    }
                    setNameSuggestions(Array.isArray(parsed) ? parsed : []);
                } else {
                    setNameSuggestions([]);
                }
            } catch {
                if (armGen !== nameSuggestGenRef.current) return;
                setNameSuggestions([]);
            } finally {
                if (armGen === nameSuggestGenRef.current) {
                    setNameSuggestLoading(false);
                }
            }
        },
        [clientId, departmentId, dispatch],
    );

    /** Advanced panel → Communication name: same debounced API as main search (aligned with Communication List). */
    const handleAdvanceCommunicationNameSearchChange = useCallback(
        (value) => {
            const trimmed = String(value ?? '').trim();
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
                nameSuggestDebounceRef.current = null;
            }
            if (trimmed.length < GALLERY_NAME_SUGGEST_MIN_CHARS) {
                nameSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                return;
            }
            nameSuggestGenRef.current += 1;
            const armGen = nameSuggestGenRef.current;
            setNameSuggestions([]);
            setNameSuggestLoading(true);
            nameSuggestDebounceRef.current = setTimeout(() => {
                nameSuggestDebounceRef.current = null;
                void fetchGalleryNameSuggestions(trimmed, armGen);
            }, GALLERY_NAME_SUGGEST_DEBOUNCE_MS);
        },
        [fetchGalleryNameSuggestions],
    );

    const dismissAdvanceCommunicationNameSuggest = useCallback(() => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
    }, []);

    const ADVANCE_FILTER_CONFIG = useMemo(
        () => buildGalleryAdvanceFilterConfig(options, userId),
        [options, userId],
    );
    advanceFilterConfigRef.current = ADVANCE_FILTER_CONFIG;

    /** Scope lives in the toolbar; do not prefix Created by chips (same as Analytics / listing). */
    const getCreatedByTagDisplayOverride = useCallback(() => undefined, []);

    const getPageSize = () => getPaginationData ?? 4;

    handleMyCommunicationsToggleRef.current = (checked) => {
        setMyCommunicationsOnly(checked);
        myCommunicationsOnlyRef.current = checked;
        setPayload((pre) => ({
            ...pre,
            filteration: {
                ...buildGalleryFiltersPayload(
                    currentFiltersRef.current,
                    pre.filteration?.sortBy,
                    advanceFilterConfigRef.current,
                    {
                        myCommunicationsOnly: checked,
                        userId,
                    },
                ),
                campaignName: pre.filteration?.campaignName ?? '',
                startDate: pre.filteration?.startDate ?? getYYMMDD(getTimezoneAdjustedStartDate()),
                endDate: pre.filteration?.endDate ?? getYYMMDD(getTimezoneAdjustedEndDate()),
                departmentId,
            },
            pagination: { pageNo: 1, pageSize: getPageSize() },
        }));
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    };

    const buildFiltration = (filters, campaignName, previousSortBy, scopeMy = myCommunicationsOnlyRef.current) => {
        const nameFromAdvance = String(
            filters?.communication_name?.rawValue ?? filters?.communication_name?.displayValue ?? '',
        ).trim();
        const effectiveCampaignName = nameFromAdvance || String(campaignName ?? '').trim();
        return {
            ...buildGalleryFiltersPayload(filters, previousSortBy, ADVANCE_FILTER_CONFIG, {
                myCommunicationsOnly: scopeMy,
                userId,
            }),
            campaignName: effectiveCampaignName,
            startDate: searchDateRef.current?.startDate ?? getYYMMDD(getTimezoneAdjustedStartDate()),
            endDate: searchDateRef.current?.endDate ?? getYYMMDD(getTimezoneAdjustedEndDate()),
            departmentId,
        };
    };

    /** Scope (My / All communications) is only shown in the toolbar dropdown — do not duplicate as a chip. */
    const supplementalFilterTags = useMemo(() => [], []);

    const buildTopSearchFilters = useCallback((type, raw, row) => {
        if (!type || type === 'Communication name') return currentFiltersRef.current || {};
        const filter = advanceFilterConfigRef.current?.find((f) => f.label === type);
        const text = String(raw ?? '').trim();
        if (!filter || !text) return currentFiltersRef.current || {};
        const data = Array.isArray(filter.data) ? filter.data : [];
        const resolvedRow =
            row ??
            find((item) => {
                const label = filter.isObject ? _get(item, filter.fieldKey || 'name', '') : item;
                return String(label ?? '').trim().toLowerCase() === text.toLowerCase();
            }) ??
            text;
        return {
            ...(currentFiltersRef.current || {}),
            [filter.key]: {
                displayValue: text,
                rawValue: filter.isMulti ? [resolvedRow] : resolvedRow,
            },
        };
    }, []);

    const handleSearch = (value, meta = {}) => {
        /** User explicitly ran search — allow repeat API even when params match last request (dedupe ref). */
        lastGalleryListRequestRef.current = null;
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const trimmed = String(value ?? '').trim();
        if (meta?.type && meta.type !== 'Communication name') {
            const filters = buildTopSearchFilters(meta.type, trimmed, meta.searchValue);
            setSearchText(trimmed);
            searchTextRef.current = '';
            setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: trimmed }));
            setPayload((pre) => {
                const { channelId, subChannelId } = resolveGalleryChannelIdsFromAdvanceFilters(filters);
                return {
                    ...pre,
                    channelId,
                    subChannelId,
                    isadvanceFilter: false,
                    filteration: buildFiltration(filters, '', pre.filteration?.sortBy),
                    pagination: { pageNo: 1, pageSize: getPageSize() },
                };
            });
            setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
            return;
        }
        const commAdvance = String(
            currentFiltersRef.current?.communication_name?.rawValue ??
            currentFiltersRef.current?.communication_name?.displayValue ??
            '',
        ).trim();
        const hideMainBarDuplicate = Boolean(commAdvance && trimmed === commAdvance);
        const valueForMainBar = hideMainBarDuplicate ? '' : trimmed;
        setSearchText(valueForMainBar);
        searchTextRef.current = valueForMainBar;
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: valueForMainBar }));
        setPayload((pre) => {
            const { channelId, subChannelId } = resolveGalleryChannelIdsFromAdvanceFilters(
                currentFiltersRef.current || {},
            );
            return {
                ...pre,
                channelId,
                subChannelId,
                isadvanceFilter: true,
                filteration: buildFiltration(currentFiltersRef.current, valueForMainBar, pre.filteration?.sortBy),
                pagination: { pageNo: 1, pageSize: getPageSize() },
            };
        });
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    };

    const handleSearchChange = (value, selectedSearchType = 'Communication name') => {
        setSearchText(value);
        searchTextRef.current = value;
        if (selectedSearchType !== 'Communication name') {
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
                nameSuggestDebounceRef.current = null;
            }
            nameSuggestGenRef.current += 1;
            setNameSuggestions([]);
            setNameSuggestLoading(false);
            return;
        }
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
        }
        const trimmed = String(value ?? '').trim();
        if (trimmed.length < GALLERY_NAME_SUGGEST_MIN_CHARS) {
            nameSuggestGenRef.current += 1;
            setNameSuggestions([]);
            setNameSuggestLoading(false);
            return;
        }
        nameSuggestGenRef.current += 1;
        const armGen = nameSuggestGenRef.current;
        setNameSuggestions([]);
        setNameSuggestLoading(true);
        nameSuggestDebounceRef.current = setTimeout(() => {
            nameSuggestDebounceRef.current = null;
            void fetchGalleryNameSuggestions(trimmed, armGen);
        }, GALLERY_NAME_SUGGEST_DEBOUNCE_MS);
    };

    const handlePickGalleryCommunicationName = (label) => {
        lastGalleryListRequestRef.current = null;
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const text = String(label ?? '').trim();
        setSearchText(text);
        searchTextRef.current = text;
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: text }));
        setPayload((pre) => {
            const { channelId, subChannelId } = resolveGalleryChannelIdsFromAdvanceFilters(
                currentFiltersRef.current || {},
            );
            return {
                ...pre,
                channelId,
                subChannelId,
                isadvanceFilter: true,
                filteration: buildFiltration(currentFiltersRef.current, text, pre.filteration?.sortBy),
                pagination: { pageNo: 1, pageSize: getPageSize() },
            };
        });
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    };

    const handleRefresh = () => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        setSearchText('');
        searchTextRef.current = '';
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
        setPayload((pre) => ({
            ...pre,
            filteration: {
                ...pre.filteration,
                campaignName: '',
            },
            pagination: { pageNo: 1, pageSize: getPageSize() },
        }));
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    };

    const handleClear = () => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        setSearchText('');
        searchTextRef.current = '';
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
        setMyCommunicationsOnly(false);
        myCommunicationsOnlyRef.current = false;
        setMyCommunicationsOnly(false);
        myCommunicationsOnlyRef.current = false;
        setCurrentFilters(GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER);
        const defCh = GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER.channel_type?.rawValue;
        const nextChannelId = defCh?.id ?? 1;
        const nextSubChannelId = resolveGalleryPayloadSubChannelId(defCh);
        setPayload((pre) => ({
            ...pre,
            channelId: nextChannelId,
            subChannelId: nextSubChannelId,
            isadvanceFilter: true,
            filteration: buildFiltration(
                GALLERY_DEFAULT_CHANNEL_ACTIVE_FILTER,
                '',
                undefined,
                true,
            ),
            pagination: { pageNo: 1, pageSize: getPageSize() },
        }));
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    };

    const handleFiltersChange = (filters, meta = {}) => {
        if (meta?.syncFiltersOnly) {
            if (!isEqual(filters, currentFiltersRef.current)) {
                currentFiltersRef.current = filters;
                setCurrentFilters(filters);
            }
            return;
        }
        skipGalleryListUntilAdvanceHydrateRef.current = false;
        if (meta.campaignNameOverride === undefined && isEqual(filters, currentFilters)) {
            return;
        }
        /** Keep in sync before `onSearch` in the same tick (`notifyParentAfterFilterChipChange` order). */
        currentFiltersRef.current = filters;
        const nameFromFilter = String(
            filters?.communication_name?.rawValue ?? filters?.communication_name?.displayValue ?? '',
        ).trim();
        const mainRef = String(searchTextRef.current ?? '').trim();
        if (nameFromFilter && mainRef === nameFromFilter) {
            setSearchText('');
            searchTextRef.current = '';
            setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
        }
        const createdByFilter = ADVANCE_FILTER_CONFIG.find((f) => f.key === 'created_by');
        const createdByRaw = filters?.created_by?.rawValue;
        let scopeMy;
        if (
            createdByFilter &&
            Array.isArray(createdByRaw) &&
            createdByRaw.length &&
            isEntireMultiSelectChosen(createdByFilter, createdByRaw)
        ) {
            setMyCommunicationsOnly(true);
            myCommunicationsOnlyRef.current = true;
            scopeMy = true;
        } else {
            scopeMy = syncMyCommunicationsScopeFromStorage();
        }
        const campaignName =
            meta.campaignNameOverride !== undefined
                ? meta.campaignNameOverride
                : searchTextRef.current;
        setCurrentFilters(filters);
        setPayload((pre) => {
            const { channelId, subChannelId } = resolveGalleryChannelIdsFromAdvanceFilters(filters);
            return {
                ...pre,
                channelId,
                subChannelId,
                isadvanceFilter: true,
                filteration: buildFiltration(filters, campaignName, pre.filteration?.sortBy, scopeMy),
                pagination: { pageNo: 1, pageSize: getPageSize() },
            };
        });
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    };

    const handleDateFilter = ({ startDate, endDate, selectedType }) => {
        const dates = { startDate: getYYMMDD(startDate), endDate: getYYMMDD(endDate), rawStartDate: startDate, rawEndDate: endDate, selectedType };
        setSearchDate(dates);
        setPayload((pre) => ({
            ...pre,
            filteration: {
                ...pre.filteration,
                startDate: startDate,
                endDate: endDate,
            },
            pagination: { pageNo: 1, pageSize: getPageSize() },
        }));
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    };

    const syncTopChannelDropdownFromAdvanceRow = useCallback(
        (row) => {
            if (row && typeof row === 'object' && row.id != null) {
                setValue('channels', row);
            }
        },
        [setValue],
    );

    const handleTopChannelSelect = useCallback(
        (selectedValue) => {
            let pickedRow = null;
            if (selectedValue && typeof selectedValue === 'object') {
                pickedRow = selectedValue;
            } else {
                const asStr = String(selectedValue ?? '').trim();
                pickedRow =
                    CHANNELSSOCIAL_LIST.find((row) => String(row?.lable || '').trim() === asStr) ||
                    CHANNELSSOCIAL_LIST.find((row) => Number(row?.id) === Number(selectedValue));
            }
            if (!pickedRow) return;
            const pickedLabel = String(pickedRow?.lable || '').trim();
            const nextFilters = {
                ...(currentFiltersRef.current || {}),
                channel_type: { displayValue: pickedLabel, rawValue: pickedRow },
            };
            currentFiltersRef.current = nextFilters;
            try {
                const filtersToSave = { ...nextFilters };
                delete filtersToSave.channel_type;
                localStorage.setItem(persistGalleryFiltersKey, JSON.stringify(filtersToSave));
            } catch {
            }
            setCurrentFilters(nextFilters);
            const nextChannelId = pickedRow?.id ?? 1;
            const nextSubChannelId = resolveGalleryPayloadSubChannelId(pickedRow);
            setPayload((pre) => ({
                ...pre,
                channelId: nextChannelId,
                subChannelId: nextSubChannelId,
                isadvanceFilter: true,
                filteration: buildFiltration(
                    nextFilters,
                    searchTextRef.current,
                    pre.filteration?.sortBy,
                    myCommunicationsOnlyRef.current,
                ),
                pagination: { pageNo: 1, pageSize: getPageSize() },
            }));
            setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
            setAdvanceSearchRemountKey((k) => k + 1);
        },
        [getPageSize, persistGalleryFiltersKey],
    );

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setConfimrationModal(true);
        } else {
            setConfimrationModal(false);
        }
    }, [departmentName]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setSearchText('');
        setMyCommunicationsOnly(false);
        myCommunicationsOnlyRef.current = false;
        setMyCommunicationsOnly(false);
        myCommunicationsOnlyRef.current = false;
        const defaultFilters = mergeGalleryActiveFiltersFromPersistedStorage(clientId, userId, departmentId);
        const ch = defaultFilters.channel_type?.rawValue;
        const nextChannelId = ch?.id ?? 1;
        const nextSubChannelId = resolveGalleryPayloadSubChannelId(ch);
        setCurrentFilters(defaultFilters);
        setPayload((pre) => ({
            ...pre,
            channelId: nextChannelId,
            subChannelId: nextSubChannelId,
            isadvanceFilter: true,
            filteration: buildFiltration(defaultFilters, '', pre.filteration?.sortBy, false),
            pagination: { pageNo: 1, pageSize: getPageSize() },
        }));
        setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: getPageSize() }));
    }, [departmentId]);

    useEffect(() => {
        if (skipGalleryListUntilAdvanceHydrateRef.current) {
            return;
        }
        const tempParams = { ...payload, departmentId };
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            return;
        }
        if (!isAgencyAccountAdmin) {
            if (lastGalleryListRequestRef.current != null && isEqual(lastGalleryListRequestRef.current, tempParams)) {
                return;
            }
            lastGalleryListRequestRef.current = cloneDeep(tempParams);
            galleryListAPI.refetch({ payload: tempParams });
        }
    }, [payload]);

    const refreshGalleryList = useCallback(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            return;
        }
        if (isAgencyAccountAdmin) {
            return;
        }
        const tempParams = { ...payload, departmentId };
        lastGalleryListRequestRef.current = null;
        galleryListAPI.refetch({ payload: tempParams });
    }, [payload, departmentId, departmentName, licenseTypeId, isAgencyAccountAdmin]);

    const [infoState, setInfoState] = useState({ loading: false, data: {} });
    const handleInfoGallery = async (infoData, campaignId, channelId, subChannelId = 0) => {
        const infoPayload = {
            channelId,
            subChannelId,
            campaignId,
            campaignGuid: infoData.campaignGuid,
            blastGuid: infoData.blastScheduleGuid,
            clientId,
            userId,
            departmentId,
        };
        setInfoState({ loading: true, data: {} });
        try {
            const { data, status } = await galleryInfoAPI.refetch({
                payload: infoPayload,
                loading: false,
            });
            if (status) {
                setInfoState({ loading: false, data: data || {} });
            } else {
                setInfoState({ loading: false, data: {} });
            }
        } catch {
            setInfoState({ loading: false, data: {} });
        }
    };

    const handleSearchExpandedChange = useCallback(
        async (expanded) => {
            if (!expanded) return;
            if (hasPersistedAdvanceFilters(persistGalleryFiltersKey)) return;
            if (!myCommunicationsOnlyRef.current) return;
            myCommunicationsOnlyRef.current = false;
            setMyCommunicationsOnly(false);
            if (!myCommunicationsOnlyRef.current) return;
            myCommunicationsOnlyRef.current = false;
            setMyCommunicationsOnly(false);
            try {
                localStorage.setItem(persistGalleryMyCommKey, 'false');
                localStorage.setItem(persistGalleryMyCommKey, 'false');
            } catch {
                /* ignore */
            }
            const size = getPaginationData ?? 4;
            setPayload((pre) => ({
                ...pre,
                filteration: {
                    ...buildGalleryFiltersPayload(
                        currentFiltersRef.current,
                        pre.filteration?.sortBy,
                        advanceFilterConfigRef.current,
                        { myCommunicationsOnly: false, userId },
                    ),
                    campaignName: pre.filteration?.campaignName ?? '',
                    startDate: pre.filteration?.startDate ?? getYYMMDD(getTimezoneAdjustedStartDate()),
                    endDate: pre.filteration?.endDate ?? getYYMMDD(getTimezoneAdjustedEndDate()),
                    departmentId,
                },
                pagination: { pageNo: 1, pageSize: size },
            }));
            setPagerPageConfig((pre) => ({ ...pre, skip: 0, take: size }));
        },
        [
            persistGalleryFiltersKey,
            persistGalleryMyCommKey,
            userId,
            departmentId,
            getPaginationData,
        ],
    );

    useEffect(() => {
        dispatch(updateGallery({ field: 'galleryData', data: {} }));
        return () => {
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
                nameSuggestDebounceRef.current = null;
            }
            dispatch(updateGallery({ field: 'galleryData', data: {} }));
        };
    }, []);



    return (
        <Fragment>
            {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                <div className="mt15">
                    <RSSkeletonTable text={true} />
                </div>
            ) : (
                <>
                    <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer">
                        <RSAdvanceSearchNew
                            key={`${persistGalleryFiltersKey}-${advanceSearchRemountKey}`}
                            activeFilters={currentFilters}
                            persistActiveFilters
                            persistActiveFiltersStorageKey={persistGalleryFiltersKey}
                            persistMergeOmitKeys={['channel_type', 'communication_type']}
                            initialActiveFilters={galleryInitialActiveFilters}
                            initialActiveFiltersSeedKey={departmentId}
                            activeFiltersRestoreOnSearchClose={galleryActiveFiltersRestoreOnSearchClose}
                            showActiveFilterTagsWhenCollapsed
                            supplementalFilterTags={supplementalFilterTags}
                            excludeActiveFilterTagKeys={GALLERY_EXCLUDE_ACTIVE_FILTER_CHIP_KEYS}
                            includeExcludedTagsWhenAdvancedOpen
                            onAdvancePanelChannelTypeRowSync={syncTopChannelDropdownFromAdvanceRow}
                            onSearchExpandedChange={handleSearchExpandedChange}
                            searchPlaceholder="Search communication"
                            advanceSearchOptions={GALLERY_ADVANCE_SEARCH_OPTIONS}
                            filterConfig={ADVANCE_FILTER_CONFIG}
                            getTagDisplayOverride={getCreatedByTagDisplayOverride}
                            onSearch={handleSearch}
                            onSearchChange={handleSearchChange}
                            onRefresh={handleRefresh}
                            onClear={handleClear}
                            onFiltersChange={handleFiltersChange}
                            searchSuggestions={nameSuggestions}
                            searchSuggestionsLoading={nameSuggestLoading}
                            onSearchSuggestionPick={handlePickGalleryCommunicationName}
                            searchValueSync={searchValueSync}
                            minCharsForSearchSubmit={GALLERY_NAME_SUGGEST_MIN_CHARS}
                            lockMainBarWhenFilterChipsPresent
                            onAdvanceCommunicationNameSearchChange={handleAdvanceCommunicationNameSearchChange}
                            onAdvanceCommunicationNameSuggestDismiss={dismissAdvanceCommunicationNameSuggest}
                            dateRangeComponent={
                                <>
                                    <RSDateRangePicker
                                        onDatePickerClosed={handleDateFilter}
                                        isTemplate
                                        allowFutureDates={true}
                                        startDate={searchDate.rawStartDate}
                                        endDate={searchDate.rawEndDate}
                                        selectedDateText={searchDate.selectedType || ''}
                                    />
                                    <RSKendoDropdown
                                        name={'channels'}
                                        control={control}
                                        data={GALLERY_TOP_CHANNEL_DROPDOWN_DATA}
                                        textField="lable"
                                        dataItemKey="sno"
                                        className={'kendo-dd-size-1'}
                                        handleChange={({ value }) => handleTopChannelSelect(value)}
                                    />
                                </>
                            }
                            createButtonComponent={
                                <RSTooltip position="top" text="Create communication" className="lh0">
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary ${!addAccess ? 'click-off' : ''}`}
                                        onClick={() => {
                                            if (addAccess) {
                                                const newState = { currentTab: null, mode: 'create' };
                                                const encryptState = encodeUrl(newState);
                                                navigate(`/communication/communication-creation?q=${encryptState}`, {
                                                    state: { current: 'gallery' },
                                                });
                                            }
                                        }}
                                    />
                                </RSTooltip>
                            }
                        />
                    </div>

                    {isLoading ? (
                        skipGallerySkeletonRef.current ? (
                            <GalleryTabSkeleton showToolbar={false} />
                        ) : (
                            <Row className="mt5 mb15">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <SkeletonGalleryCard key={`loading-skeleton-${idx}`} isLoading={isLoading} />
                                ))}
                            </Row>
                        )
                    ) : !isFailure ? (
                        <Row>
                            {galleryList?.length > 0 && galleryList.map((list, index) => (
                                <ResTemplateCard
                                    list={list}
                                    key={index}
                                    infoData={infoState.data}
                                    infoFactLoading={infoState.loading}
                                    handleInfoGallery={handleInfoGallery}
                                    currentChannelId={payload.channelId}
                                    onGalleryListRefresh={refreshGalleryList}
                                />
                            ))}
                        </Row>
                    ) : (
                        <Row className="position-relative">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <SkeletonGalleryCard
                                    key={`no-data-skeleton-${idx}`}
                                    isNoDataAvailable={true}
                                    isLoading={isLoading}
                                />
                            ))}
                            {!isCampaign ? (
                                <div className="gallery-no-data-message">
                                    <span className="nodata-bar">
                                        {ADD_FIRST_COMMUNICATION_1}
                                        <i
                                            onClick={() => {
                                                if (addAccess) {
                                                    const newState = { currentTab: null, mode: 'create' };
                                                    const encryptState = encodeUrl(newState);
                                                    navigate(`/communication/communication-creation?q=${encryptState}`, {
                                                        state: { current: 'gallery' },
                                                    });
                                                }
                                            }}
                                            className={`${departmentName?.toLowerCase() === 'all' && licenseTypeId == '3' ? 'click-off' : ''} ${circle_plus_fill_medium} icon-md px5 color-primary-blue`}
                                            id="rs_data_circle_plus_fill"
                                            style={{ cursor: addAccess && !(departmentName?.toLowerCase() === 'all' && licenseTypeId == '3') ? 'pointer' : 'default' }}
                                        />
                                            {ADD_FIRST_COMMUNICATION_2} {galleryChannelLabel?.toLowerCase() ?? ''}.
                                    </span>
                                </div>
                            ) : (
                                <div className="gallery-no-data-message">
                                    <span className="nodata-bar">
                                        <i className={`${alert_medium} icon-md color-primary-orange mr5 cursor-default`} />
                                        No data available
                                    </span>
                                </div>
                            )}
                        </Row>
                    )}

                    {galleryData?.totalRecords > 4 && (
                        <Row style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.2s ease-in-out' }}>
                            <RSPager
                                isGallery={true}
                                data={galleryData?.items ?? []}
                                totalRow={galleryData?.totalRecords ?? 0}
                                className="mt0"
                                change={(data, skip, take) => {
                                    setGetPaginationData(take);
                                    const size = skip === 0 ? 1 : skip / take + 1;
                                    setPagerPageConfig((pre) => ({ ...pre, skip, take }));
                                    setPayload((pre) => ({
                                        ...pre,
                                        pagination: { pageNo: size, pageSize: take },
                                    }));
                                }}
                                config={pagerPageConfig}
                            />
                        </Row>
                    )}

                    {!isLoading && (
                        <ul className="rs-legend">
                            <li>
                                <span className="rsl-status legend-alerted" />{ALERT}
                            </li>
                            <li>
                                <span className="rsl-status legend-scheduled" />{SCHEDULED}
                            </li>
                            <li>
                                <span className="rsl-status legend-inprogress" />{IN_PROGRESS}
                            </li>
                            <li>
                                <span className="rsl-status legend-completed" />{COMPLETED}
                            </li>
                        </ul>
                    )}
                </>
            )}
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={() => setConfimrationModal(false)}
                handleConfirm={() => setConfimrationModal(false)}
                secondaryButton={false}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </Fragment>
    );
};

export default CommunicationGallery;
