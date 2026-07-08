import { getDateFormat, getDateWithDaynoFormat } from 'Utils/modules/dateTime';
import { encodeUrl } from 'Utils/modules/crypto';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get as _get, isEqual } from 'Utils/modules/lodashReplacements';

import RSAdvanceSearchNew, {
    buildAdvanceSearchPersistStorageKey,
    hasPersistedAdvanceFilters,
    isEntireMultiSelectChosen,
    resolveMyCommunicationsScopeFromStorage,
} from 'Components/AdvanceSearchNew';
import RSDateRangePicker from 'Components/RSDateRangePicker';

import { getYYMMDD, convertToUserTimezone, convertUTCtoUserTimezone } from 'Utils/modules/dateTime';

import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import {
    getCommunicationList,
    getSearchDropdownDataCommunicationList,
} from 'Reducers/communication/listing/request';
import useApiLoader from 'Hooks/useApiLoader';
import {
    buildPayload,
    initialDataState,
    buildAdvanceFilterConfig,
    buildSearchPayload,
    buildClearPayload,
    extractMultiValues,
} from '../../constant';
import {
    fetchCommunicationListingFilterOptionResponses,
    mapFilterResponsesToOptionsState,
} from 'Pages/AuthenticationModule/Communication/CommunicationLists/loadCommunicationListingFilterOptions';
import RSTooltip from 'Components/RSTooltip';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import usePermission from 'Hooks/usePersmission';

import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import {
    COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS,
    COMMUNICATION_LISTING_DEFAULT_INITIAL_ACTIVE_FILTERS,
} from 'Constants/AdvanceSearch';
import { GOLDEN_CAMPAIGN } from 'Constants/GlobalConstant/Placeholders';

/** Same options as RESUL-Proto `GRID_DROPDOWN_DATA` (corrected spelling); default selection = My communications. */
export const LISTING_SCOPE_DROPDOWN_DATA = ['All communications', 'My communications',GOLDEN_CAMPAIGN];

const LISTING_SCOPE = {
    ALL: 'all',
    MY: 'my',
    GOLDEN: 'golden',
};

/** Debounce for CommunicationlistSearchName (name suggestions only). */
const LISTING_NAME_SUGGEST_DEBOUNCE_MS = 400;
const LISTING_NAME_SUGGEST_MIN_CHARS = 3;
const LISTING_ADVANCE_SEARCH_OPTIONS = ['Communication name', 'Communication type', 'Delivery type'];

const HeaderCell = ({ requestPayload, setRequestPayload, setCampaignData, setFormState, isLoading: _isLoading }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state) ?? {});
    const utcTimeData = useSelector((state) => getUtcTimeData(state) ?? {});
    const communicationOptions = useSelector(
        (state) => state.communicationPlanReducer?.communicationOptions ?? {},
    );
    const planDropdownsFetchedFor = useSelector(
        (state) => state.communicationPlanReducer?.planDropdownsFetchedFor ?? null,
    );
    const planDropdownCacheRef = useRef({ communicationOptions, planDropdownsFetchedFor });
    planDropdownCacheRef.current = { communicationOptions, planDropdownsFetchedFor };

    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    const getTimezoneAdjustedStartDate = () => {
        let baseDate;
        if (utcTimeData.utcTime) {
            baseDate = new Date(currentUTCdateTime);
            baseDate.setDate(baseDate.getDate() + LAST30DAYS_DATEFILTER);
        } else {
            baseDate = new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER));
        }
        if (utcTimeData.utcTime) {
            return convertUTCtoUserTimezone(baseDate);
        }
        return convertToUserTimezone(baseDate, { formatAsString: false });
    };

    const getTimezoneAdjustedEndDate = () => {
        if (utcTimeData.utcTime) {
            return convertUTCtoUserTimezone(currentUTCdateTime);
        }
        return convertToUserTimezone(new Date(), { formatAsString: false });
    };

    const [options, setOptions] = useState({
        productType: [],
        communicationType: [],
        tags: [],
        users: [],
    });
    const [searchDate, setSearchDate] = useState({});
    const [searchText, setSearchText] = useState('');
    const [currentFilters, setCurrentFilters] = useState(() => ({
        ...COMMUNICATION_LISTING_DEFAULT_INITIAL_ACTIVE_FILTERS,
    }));
    const [myCommunicationsOnly, setMyCommunicationsOnly] = useState(true);
    const myCommunicationsOnlyRef = useRef(true);
    const [isGoldenCampaignOnly, setIsGoldenCampaignOnly] = useState(false);
    const isGoldenCampaignOnlyRef = useRef(false);
    const handleMyCommunicationsToggleRef = useRef(() => { });

    const requestPayloadRef = useRef(requestPayload);
    const searchDateRef = useRef(searchDate);
    const searchTextRef = useRef(searchText);
    const currentFiltersRef = useRef(currentFilters);
    const advanceFilterConfigRef = useRef(null);
    const nameSuggestDebounceRef = useRef(null);
    const nameSuggestGenRef = useRef(0);
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [nameSuggestLoading, setNameSuggestLoading] = useState(false);
    const [searchValueSync, setSearchValueSync] = useState({ rev: 0, value: '' });

    useEffect(() => { searchDateRef.current = searchDate; }, [searchDate]);
    useEffect(() => { requestPayloadRef.current = requestPayload; }, [requestPayload]);
    /** Do not sync searchTextRef from state — it can lag typing and overwrite the ref used for API name. Ref is set in search handlers. */
    useEffect(() => { currentFiltersRef.current = currentFilters; }, [currentFilters]);
    useEffect(() => {
        myCommunicationsOnlyRef.current = myCommunicationsOnly;
    }, [myCommunicationsOnly]);

    const persistListingFiltersKey = useMemo(
        () => buildAdvanceSearchPersistStorageKey('comm-listing', clientId, userId, departmentId),
        [clientId, userId, departmentId],
    );
    const persistListingMyCommKey = useMemo(
        () => `${persistListingFiltersKey}:my-comm`,
        [persistListingFiltersKey],
    );
    const persistListingScopeKey = useMemo(
        () => `${persistListingFiltersKey}:scope`,
        [persistListingFiltersKey],
    );
    const persistListingDateKey = useMemo(
        () => `${persistListingFiltersKey}:date-range`,
        [persistListingFiltersKey],
    );

    const applyListingScope = useCallback((scope) => {
        const isMy = scope === LISTING_SCOPE.MY;
        const isGolden = scope === LISTING_SCOPE.GOLDEN;
        setMyCommunicationsOnly(isMy);
        myCommunicationsOnlyRef.current = isMy;
        setIsGoldenCampaignOnly(isGolden);
        isGoldenCampaignOnlyRef.current = isGolden;
    }, []);

    const readListingScopeFromStorage = useCallback(() => {
        try {
            const rawScope = localStorage.getItem(persistListingScopeKey);
            if (
                rawScope === LISTING_SCOPE.ALL ||
                rawScope === LISTING_SCOPE.MY ||
                rawScope === LISTING_SCOPE.GOLDEN
            ) {
                return rawScope;
            }
            const legacyMyComm = localStorage.getItem(persistListingMyCommKey);
            if (legacyMyComm === 'true') return LISTING_SCOPE.MY;
            if (legacyMyComm === 'false') return LISTING_SCOPE.ALL;
        } catch {
            /* ignore */
        }
        return LISTING_SCOPE.MY;
    }, [persistListingMyCommKey, persistListingScopeKey]);

    const persistListingScope = useCallback(
        (scope) => {
            try {
                localStorage.setItem(persistListingScopeKey, scope);
            } catch {
                /* ignore */
            }
        },
        [persistListingScopeKey],
    );

    const readListingDateFromStorage = useCallback(() => {
        try {
            const raw = localStorage.getItem(persistListingDateKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.startDate && parsed?.endDate) {
                    return parsed;
                }
            }
        } catch {
            /* ignore */
        }
        const rawStartDate = getTimezoneAdjustedStartDate();
        const rawEndDate = getTimezoneAdjustedEndDate();
        return {
            startDate: getYYMMDD(rawStartDate),
            endDate: getYYMMDD(rawEndDate),
            rawStartDate,
            rawEndDate,
            selectedType: 'Last 30 days',
        };
    }, [persistListingDateKey]);

    const persistListingDateRange = useCallback(
        (dates) => {
            try {
                localStorage.setItem(persistListingDateKey, JSON.stringify(dates));
            } catch {
                /* ignore */
            }
        },
        [persistListingDateKey],
    );

    const syncMyCommunicationsScopeFromStorage = useCallback(() => {
        const next = resolveMyCommunicationsScopeFromStorage({
            persistFiltersStorageKey: persistListingFiltersKey,
            persistMyCommScopeKey: persistListingMyCommKey,
            fallbackFromRef: myCommunicationsOnlyRef.current,
        });
        if (next !== myCommunicationsOnlyRef.current) {
            myCommunicationsOnlyRef.current = next;
            setMyCommunicationsOnly(next);
        }
        return next;
    }, [persistListingFiltersKey, persistListingMyCommKey]);

    useLayoutEffect(() => {
        if (!clientId || departmentId == null) return;
        applyListingScope(readListingScopeFromStorage());
        const dates = readListingDateFromStorage();
        setSearchDate(dates);
        searchDateRef.current = dates;
    }, [
        applyListingScope,
        clientId,
        departmentId,
        readListingDateFromStorage,
        readListingScopeFromStorage,
    ]);

    const listingInitialFetchDoneRef = useRef(false);

    useEffect(() => {
        if (!clientId || departmentId == null || listingInitialFetchDoneRef.current) return;
        listingInitialFetchDoneRef.current = true;

        try {
            localStorage.removeItem(persistListingFiltersKey);
        } catch {
            /* ignore */
        }

        const scope = readListingScopeFromStorage();
        const dates = searchDateRef.current?.startDate ? searchDateRef.current : readListingDateFromStorage();
        const defaultFilters = { ...COMMUNICATION_LISTING_DEFAULT_INITIAL_ACTIVE_FILTERS };
        currentFiltersRef.current = defaultFilters;
        setCurrentFilters(defaultFilters);
        setFormState(defaultFilters);

        const { pageSize } = requestPayloadRef.current || {};
        const payload = buildSearchPayload({
            filters: defaultFilters,
            restPayload: {
                startDate: dates.startDate,
                endDate: dates.endDate,
            },
            name: '',
            departmentId,
            clientId,
            userId,
            pageSize,
            myCommunicationsOnly: scope === LISTING_SCOPE.MY,
            overrides: { isGoldenCampaign: scope === LISTING_SCOPE.GOLDEN },
            advanceFilterConfig: advanceFilterConfigRef.current,
        });
        void getListRef.current(payload);
    }, [clientId, departmentId, userId, persistListingFiltersKey, readListingDateFromStorage, readListingScopeFromStorage]);

    useEffect(() => {
        return () => {
            try {
                localStorage.removeItem(persistListingFiltersKey);
            } catch {
                /* ignore */
            }
        };
    }, [persistListingFiltersKey]);

    useEffect(
        () => () => {
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
            }
        },
        [],
    );

    useEffect(() => {
        const fetchproducts = async () => {
            const scope = { clientId, userId, departmentId };
            const { communicationOptions: co, planDropdownsFetchedFor: pf } = planDropdownCacheRef.current;
            const responses = await fetchCommunicationListingFilterOptionResponses(dispatch, scope, {
                communicationOptions: co,
                planDropdownsFetchedFor: pf,
            });
            setOptions(mapFilterResponsesToOptionsState(responses, { dedupeUsers: true }));
        };
        fetchproducts();
    }, [clientId, userId, departmentId, dispatch]);

    const getListRef = useRef(async () => { });
    const communicationListAPI = useApiLoader({ actionCreator: getCommunicationList });
    const nameSuggestAPI = useApiLoader({ actionCreator: getSearchDropdownDataCommunicationList });

    /** Set during `handleSearch` so `onFiltersChange({ forceSubmit })` does not double-fetch the same submit. */
    const listingSubmitFetchHandledRef = useRef(false);

    async function getList(payload) {
        await communicationListAPI.refetch({ payload });
        const { pageSize } = requestPayload;
        let getInitialDataState = initialDataState;
        if (pageSize != null) {
            getInitialDataState = { skip: 0, take: pageSize };
        }
        setCampaignData((prev) => ({ ...prev, dataState: getInitialDataState }));
        setRequestPayload(payload);
    }

    getListRef.current = getList;

    handleMyCommunicationsToggleRef.current = async (checked, golden = false) => {
        const scope = golden ? LISTING_SCOPE.GOLDEN : checked ? LISTING_SCOPE.MY : LISTING_SCOPE.ALL;
        persistListingScope(scope);
        applyListingScope(scope);
        const { pageSize, ...restRequestPayload } = requestPayloadRef.current;
        const payload = buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: restRequestPayload,
            name: searchTextRef.current,
            departmentId,
            clientId,
            userId,
            pageSize,
            overrides: { isGoldenCampaign: golden },
            myCommunicationsOnly: checked,
            advanceFilterConfig: advanceFilterConfigRef.current,
        });
        setFormState(currentFiltersRef.current);
        await getList(payload);
    };

    const ADVANCE_FILTER_CONFIG = useMemo(
        () => buildAdvanceFilterConfig(options, userId, { myCommunicationsOnly }),
        [options, userId, myCommunicationsOnly],
    );
    advanceFilterConfigRef.current = ADVANCE_FILTER_CONFIG;

    /** Normal search: selected name lives only in the main input (no supplemental “Communication name” chip). */
    const supplementalFilterTags = useMemo(() => [], []);

    /**
     * After user removes “My communications”, closes search, and opens again, restore default scope:
     * chip + checked + API (same as first visit). Previous sync-from-payload kept UI off when userId was 0.
     */
    const handleSearchExpandedChange = useCallback(
        async (expanded) => {
            if (!expanded) {
                nameSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                if (nameSuggestDebounceRef.current) {
                    clearTimeout(nameSuggestDebounceRef.current);
                    nameSuggestDebounceRef.current = null;
                }

                // Remove the default created_by user filter when advanced search is closed/collapsed
                const nextFilters = { ...(currentFiltersRef.current || {}) };
                if (nextFilters.created_by) {
                    delete nextFilters.created_by;
                    currentFiltersRef.current = nextFilters;
                    setCurrentFilters(nextFilters);
                    setFormState(nextFilters);
                }
                return;
            }

            const currentUser = options.users?.find((u) => Number(u.userId) === Number(userId));

            if (myCommunicationsOnlyRef.current) {
                if (currentUser && !currentFiltersRef.current?.created_by) {
                    const nextFilters = {
                        ...(currentFiltersRef.current || {}),
                        created_by: {
                            displayValue: currentUser.firstName,
                            rawValue: [currentUser],
                        },
                    };
                    currentFiltersRef.current = nextFilters;
                    setCurrentFilters(nextFilters);
                    setFormState(nextFilters);
                }
                return;
            }

            /** Golden communications is a deliberate scope choice — don't silently fall back to “My communications”. */
            if (isGoldenCampaignOnlyRef.current) return;

            if (hasPersistedAdvanceFilters(persistListingFiltersKey)) return;

            persistListingScope(LISTING_SCOPE.MY);
            applyListingScope(LISTING_SCOPE.MY);

            const nextFilters = { ...(currentFiltersRef.current || {}) };
            if (currentUser) {
                nextFilters.created_by = {
                    displayValue: currentUser.firstName,
                    rawValue: [currentUser],
                };
            }
            currentFiltersRef.current = nextFilters;
            setCurrentFilters(nextFilters);
            setFormState(nextFilters);

            const { pageSize, ...restRequestPayload } = requestPayloadRef.current;
            const payload = buildSearchPayload({
                filters: nextFilters,
                restPayload: restRequestPayload,
                name: searchTextRef.current,
                departmentId,
                clientId,
                userId,
                pageSize,
                myCommunicationsOnly: true,
                advanceFilterConfig: advanceFilterConfigRef.current,
            });
            await getListRef.current(payload);
        },
        [departmentId, clientId, userId, persistListingFiltersKey, options.users, applyListingScope, persistListingScope],
    );

    const buildFilterPayload = (overrides = {}) => {
        const scopeMy = syncMyCommunicationsScopeFromStorage();
        const raw = requestPayloadRef.current || {};
        const { pageSize, name: _staleName, ...restRequestPayload } = raw;
        const nameForSearch = Object.prototype.hasOwnProperty.call(overrides, 'name')
            ? String(overrides.name ?? '').trim()
            : String(searchTextRef.current ?? '').trim();
        return buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: restRequestPayload,
            name: nameForSearch,
            departmentId,
            clientId,
            userId,
            pageSize,
            overrides: {
                ...overrides,
                name: nameForSearch,
                isGoldenCampaign: isGoldenCampaignOnlyRef.current,
            },
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: advanceFilterConfigRef.current,
        });
    };

    const handleDatePickerChange = async ({ startDate, endDate, selectedType }) => {
        const dates = {
            startDate: getYYMMDD(startDate),
            endDate: getYYMMDD(endDate),
            rawStartDate: startDate,
            rawEndDate: endDate,
            selectedType: selectedType || '',
        };
        setSearchDate(dates);
        searchDateRef.current = dates;
        persistListingDateRange(dates);
        const { pageSize } = requestPayload;
        const scopeMy = syncMyCommunicationsScopeFromStorage();
        const payload = buildPayload(
            {
                ...requestPayload,
                ...dates,
                departmentId,
                index: 1,
                pageSize,
                clientId,
                userId: scopeMy ? userId : 0,
                isGoldenCampaign: isGoldenCampaignOnlyRef.current,
                createdBy:
                    scopeMy && !requestPayload?.createdBy
                        ? String(userId)
                        : requestPayload?.createdBy ?? '',
            },
            true,
        );
        await getList(payload);
    };

    const fetchCommunicationNameSuggestions = useCallback(
        async (text, armGen) => {
            const trimmed = String(text ?? '').trim();
            if (trimmed.length < LISTING_NAME_SUGGEST_MIN_CHARS) {
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
            const p = requestPayloadRef.current || {};
            const scopeMy = myCommunicationsOnlyRef.current;
            const listUserId =
                p.userId !== undefined && p.userId !== null && String(p.userId) !== ''
                    ? Number(p.userId)
                    : scopeMy
                        ? userId
                        : 0;
            const createdByForSuggest =
                p.createdBy != null && p.createdBy !== undefined
                    ? String(p.createdBy)
                    : scopeMy
                        ? String(userId)
                        : '';
            const filters = currentFiltersRef.current || {};
            const entry = filters?.channel_type;
            const disp = String(entry?.displayValue ?? '').trim();
            const cfg = advanceFilterConfigRef.current?.find((f) => f.key === 'channel_type');
            const field = cfg?.fieldKey || 'name';

            /** Chip text (`displayValue`) is authoritative; `rawValue` can be stale or wrong order vs. the chip. */
            let chRowsFromDisplay = [];
            if (disp && cfg && Array.isArray(cfg.data)) {
                const parts = disp
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                chRowsFromDisplay = parts
                    .map((n) =>
                        cfg.find(
                            (row) =>
                                String(_get(row, field, '')).trim().toLowerCase() === n.toLowerCase(),
                        ),
                    )
                    .filter(Boolean);
            }
            const chRawFallback = Array.isArray(entry?.rawValue) && entry.rawValue.length ? entry.rawValue : [];
            const chRowsFinal = chRowsFromDisplay.length ? chRowsFromDisplay : chRawFallback;

            let channelId =
                Number.isFinite(Number(p.channelId)) && Number(p.channelId) > 0 ? Number(p.channelId) : undefined;
            let subChannelId = Number.isFinite(Number(p.subChannelId)) ? Number(p.subChannelId) : 0;
            const primaryChannelRow =
                chRowsFinal.length &&
                    chRowsFinal[chRowsFinal.length - 1] &&
                    typeof chRowsFinal[chRowsFinal.length - 1] === 'object'
                    ? chRowsFinal[chRowsFinal.length - 1]
                    : null;
            if (primaryChannelRow && primaryChannelRow.id != null) {
                channelId = Number(primaryChannelRow.id);
                subChannelId = Number(primaryChannelRow.subChannelId ?? 0);
            }
            const channelTypeCsv =
                chRowsFinal.length ? extractMultiValues(chRowsFinal, 'id') : String(p.channelType ?? '');
            const searchPayload = {
                clientId,
                userId: Number.isFinite(listUserId) ? listUserId : 0,
                departmentId,
                createdBy: createdByForSuggest,
                searchText: trimmed,
                searchType: 'CommunicationList',
                startDate: searchDateRef.current?.startDate ?? getYYMMDD(getTimezoneAdjustedStartDate()),
                endDate: searchDateRef.current?.endDate ?? getYYMMDD(getTimezoneAdjustedEndDate()),
                timezoneid: timeZoneId ?? 0,
                ...(channelTypeCsv ? { channelType: channelTypeCsv } : {}),
                ...(channelId != null && Number.isFinite(channelId) ? { channelId, subChannelId } : {}),
            };
            try {
                const response = await nameSuggestAPI.refetch({
                    payload: searchPayload,
                    loading: false,
                });
                if (armGen !== nameSuggestGenRef.current) return;
                if (response?.status && response?.data != null) {
                    const raw = response?.data;
                    if (
                        raw === 'No data found' ||
                        raw === 'No data available' ||
                        (typeof raw === 'string' && raw.trim().toLowerCase() === 'no data found')
                    ) {
                        setNameSuggestions([]);
                    } else {
                        let parsed = [];
                        try {
                            parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch {
                            parsed = [];
                        }
                        setNameSuggestions(Array.isArray(parsed) ? parsed : []);
                    }
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
        [clientId, departmentId, dispatch, userId],
    );

    /** Advanced panel → Communication name: same debounced API as main search. */
    const handleAdvanceCommunicationNameSearchChange = useCallback(
        (value) => {
            const trimmed = String(value ?? '').trim();
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
                nameSuggestDebounceRef.current = null;
            }
            if (trimmed.length < LISTING_NAME_SUGGEST_MIN_CHARS) {
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
                void fetchCommunicationNameSuggestions(trimmed, armGen);
            }, LISTING_NAME_SUGGEST_DEBOUNCE_MS);
        },
        [fetchCommunicationNameSuggestions],
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

    const handleSearch = async (value, meta = {}) => {
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
            const { pageSize, ...restRequestPayload } = requestPayloadRef.current;
            const scopeMy = syncMyCommunicationsScopeFromStorage();
            const payload = buildSearchPayload({
                filters,
                restPayload: restRequestPayload,
                name: '',
                departmentId,
                clientId,
                userId,
                pageSize,
                myCommunicationsOnly: scopeMy,
                advanceFilterConfig: advanceFilterConfigRef.current,
            });
            setFormState(currentFiltersRef.current);
            await getListRef.current(payload);
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
        searchTextRef.current = trimmed;
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: valueForMainBar }));

        const nextFilters = { ...(currentFiltersRef.current || {}) };
        if (trimmed) {
            nextFilters.communication_name = { displayValue: trimmed, rawValue: trimmed };
        } else {
            delete nextFilters.communication_name;
        }
        currentFiltersRef.current = nextFilters;
        setCurrentFilters(nextFilters);

        listingSubmitFetchHandledRef.current = true;
        try {
            const { pageSize, ...restRequestPayload } = requestPayloadRef.current;
            const scopeMy = syncMyCommunicationsScopeFromStorage();
            const payload = buildSearchPayload({
                filters: nextFilters,
                restPayload: restRequestPayload,
                name: trimmed,
                departmentId,
                clientId,
                userId,
                pageSize,
                myCommunicationsOnly: scopeMy,
                advanceFilterConfig: advanceFilterConfigRef.current,
            });
            setFormState(nextFilters);
            await getListRef.current(payload);
        } finally {
            listingSubmitFetchHandledRef.current = false;
        }
    };

    const handlePickCommunicationName = async (label) => {
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
        const { pageSize, ...restRequestPayload } = requestPayloadRef.current;
        const scopeMy = syncMyCommunicationsScopeFromStorage();
        const payload = buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: restRequestPayload,
            name: text,
            departmentId,
            clientId,
            userId,
            pageSize,
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: advanceFilterConfigRef.current,
        });
        setFormState(currentFiltersRef.current);
        await getListRef.current(payload);
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
        if (trimmed.length < LISTING_NAME_SUGGEST_MIN_CHARS) {
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
            void fetchCommunicationNameSuggestions(trimmed, armGen);
        }, LISTING_NAME_SUGGEST_DEBOUNCE_MS);
    };

    const handleRefresh = async () => {
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
        const payload = buildFilterPayload({ name: '' });
        await getList(payload);
    };

    const handleClear = async () => {
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
        setCurrentFilters({});
        setFormState({});
        persistListingScope(LISTING_SCOPE.MY);
        applyListingScope(LISTING_SCOPE.MY);
        const start = getTimezoneAdjustedStartDate();
        const { pageSize } = requestPayload;
        const payload = buildClearPayload({
            departmentId,
            clientId,
            userId,
            pageSize,
            startDate: searchDateRef.current?.startDate ?? getYYMMDD(start),
            endDate: searchDateRef.current?.endDate ?? getYYMMDD(getTimezoneAdjustedEndDate()),
            listingDefaultScopeCreatedBy: true,
        });
        setRequestPayload({});
        await getList(payload);
    };

    const handleFiltersChange = async (filters, meta = {}) => {
        if (meta?.syncFiltersOnly) {
            if (!isEqual(filters, currentFiltersRef.current)) {
                currentFiltersRef.current = filters;
                setCurrentFilters(filters);
                setFormState(filters);
            }
            return;
        }
        if (isEqual(filters, currentFiltersRef.current) && !meta?.forceSubmit) {
            return;
        }
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
        setCurrentFilters(filters);
        const { pageSize, ...restRequestPayload } = requestPayloadRef.current;
        const payload = buildSearchPayload({
            filters,
            restPayload: restRequestPayload,
            name: nameFromFilter || searchTextRef.current,
            departmentId,
            clientId,
            userId,
            pageSize,
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: ADVANCE_FILTER_CONFIG,
        });
        setFormState(filters);
        if (meta?.forceSubmit && listingSubmitFetchHandledRef.current) {
            return;
        }
        await getList(payload);
    };

    return (
        <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer w-100">
            <RSAdvanceSearchNew
                activeFilters={currentFilters}
                persistActiveFilters
                persistActiveFiltersStorageKey={persistListingFiltersKey}
                initialActiveFilters={COMMUNICATION_LISTING_DEFAULT_INITIAL_ACTIVE_FILTERS}
                excludeActiveFilterTagKeys={COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS}
                searchPlaceholder="Search communication"
                advanceSearchOptions={LISTING_ADVANCE_SEARCH_OPTIONS}
                filterConfig={ADVANCE_FILTER_CONFIG}
                supplementalFilterTags={supplementalFilterTags}
                onSearchExpandedChange={handleSearchExpandedChange}
                onSearch={handleSearch}
                onSearchChange={handleSearchChange}
                onRefresh={handleRefresh}
                onClear={handleClear}
                onFiltersChange={handleFiltersChange}
                searchSuggestions={nameSuggestions}
                searchSuggestionsLoading={nameSuggestLoading}
                onSearchSuggestionPick={handlePickCommunicationName}
                searchValueSync={searchValueSync}
                lockMainBarWhenFilterChipsPresent
                onAdvanceCommunicationNameSearchChange={handleAdvanceCommunicationNameSearchChange}
                onAdvanceCommunicationNameSuggestDismiss={dismissAdvanceCommunicationNameSuggest}
                minCharsForSearchSubmit={LISTING_NAME_SUGGEST_MIN_CHARS}
                dateRangeComponent={
                    <RSDateRangePicker
                        onDatePickerClosed={handleDatePickerChange}
                        isTemplate
                        allowFutureDates={true}
                        startDate={searchDate.rawStartDate}
                        endDate={searchDate.rawEndDate}
                        selectedDateText={searchDate.selectedType || ''}
                    />
                }
                auxiliaryRightControls={
                    <div className={_isLoading ? 'pe-none opacity-60' : ''}>
                        <BootstrapDropdown
                            data={LISTING_SCOPE_DROPDOWN_DATA}
                            defaultItem={
                                isGoldenCampaignOnly
                                    ? GOLDEN_CAMPAIGN
                                    : myCommunicationsOnly
                                        ? 'My communications'
                                        : 'All communications'
                            }
                            alignRight
                            containerClass="comm-listing-scope-dd"
                            className="comm-listing-scope-dd__rs"
                            onSelect={(item) => {
                                const nextGolden = item === GOLDEN_CAMPAIGN;
                                const nextMy = item === 'My communications';
                                void handleMyCommunicationsToggleRef.current(nextMy, nextGolden);
                            }}
                        />
                    </div>
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
                                        state: { current: 'communication' },
                                    });
                                }
                            }}
                        />
                    </RSTooltip>
                }
            />
        </div>
    );
};

export default HeaderCell;