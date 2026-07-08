import { advance_search_arrow_double_down_mini, advance_search_arrow_double_up_mini, advance_search_arrow_left_mini, advance_search_arrow_right_mini, advance_search_close_mini, advance_search_justify_dropdown_mini, circle_zoom_fill_edge_large, clear_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { get as _get } from 'Utils/modules/lodashReplacements';
import RSBootstrapdown, { RS_ADVANCE_SEARCH_DROPDOWN_POPPER_CONFIG } from 'Components/FormFields/RSBootstrapdown';
import RSInput from 'Components/FormFields/RSInput';
import RSMultiSelectNew from 'Components/FormFields/RSMultiSelect_Advance_Search';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    buildAdvanceFilterChipTagsList,
    hasBlockingAdvanceFilterChips,
    hasPersistedAdvanceFilters,
    MAIN_BAR_NON_BLOCKING_FILTER_KEYS,
    DEFAULT_EXCLUDE_ACTIVE_FILTER_TAG_KEYS,
    DEFAULT_SEARCH_PLACEHOLDER,
    DEFAULT_SELECT_ALL_TAG_LABEL,
    SUGGESTION_LIST_EMPTY_LABEL,
    getDropdownDefaultItem,
    getSuggestionPanelVisibility,
    isEntireMultiSelectChosen,
    meetsSuggestionCharsThreshold,
    parseMinCharsForSearchSubmit,
    resolveAutoSuggestLabel,
    shouldAllowSearchSubmit,
    STABLE_ROW_ID_KEYS,
} from './constant';
import {
    DEFAULT_ADVANCE_SEARCH_SORT_BY_ID,
    DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE,
} from './advanceSearchNewDefaults';
import './RSAdvanceSearchNew.scss';


/** Avoid toolbar Search / Enter firing a list request when only default sort is present (no chips, no name query). */
function shouldSkipSearchSubmitDueToInertState(activeFilters, shouldSubmitCommittedName, hasActiveFilterTags) {
    if (shouldSubmitCommittedName) return false;
    if (hasActiveFilterTags) return false;
    if (!activeFilters || typeof activeFilters !== 'object') return true;
    const keys = Object.keys(activeFilters);
    if (keys.length === 0) return true;
    if (keys.length > 1) return false;
    if (keys[0] !== 'sort_type') return false;
    const raw = activeFilters.sort_type?.rawValue;
    const id =
        raw != null && typeof raw === 'object' && !Array.isArray(raw)
            ? Number(raw.id)
            : Number(raw);
    return Number.isFinite(id) && id === DEFAULT_ADVANCE_SEARCH_SORT_BY_ID;
}

function cloneAdvanceFiltersDeep(obj) {
    if (!obj || typeof obj !== 'object') return {};
    try {
        if (typeof structuredClone === 'function') {
            return structuredClone(obj);
        }
    } catch {
    }
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return { ...obj };
    }
}

function mergePersistedActiveFiltersWithInitial(parsed, initialActiveFilters, persistMergeOmitKeys) {
    if (
        initialActiveFilters &&
        typeof initialActiveFilters === 'object' &&
        Object.keys(initialActiveFilters).length > 0
    ) {
        const merged = { ...initialActiveFilters, ...parsed };
        if (Array.isArray(persistMergeOmitKeys)) {
            persistMergeOmitKeys.forEach((k) => {
                if (k != null && k !== '') {
                    if (initialActiveFilters[k] !== undefined) {
                        merged[k] = initialActiveFilters[k];
                    } else {
                        delete merged[k];
                    }
                }
            });
        }
        return merged;
    }
    return parsed;
}

/**
 * Main-bar text search is session-only: do not persist so tab / route changes do not show stale text
 * with an empty API name. Covers Communication list/gallery, Communication analytics, Audience lists
 * (same `communication_name` key), and any extra `type: 'input'` rows in `filterConfig`.
 * Always drops `communication_name` so persistence still works if `filterConfig` is briefly empty on mount.
 */
function omitNonPersistedMainBarSearchKeysFromPersistSnapshot(obj, filterConfig) {
    if (!obj || typeof obj !== 'object') return obj;
    const drop = new Set(['communication_name']);
    if (Array.isArray(filterConfig)) {
        filterConfig.forEach((f) => {
            if (f?.type === 'input' && f?.key != null && String(f.key).trim() !== '') {
                drop.add(f.key);
            }
        });
    }
    let next = obj;
    let changed = false;
    drop.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(next, key)) {
            if (!changed) {
                next = { ...obj };
                changed = true;
            }
            delete next[key];
        }
    });
    return next;
}

const ADVANCE_SEARCH_PERSIST_FORMAT_V1 = 1;
const ADVANCE_SEARCH_CLUSTER_GAP_PX = 15;
const ADVANCE_PANEL_MOTION_EASE = [0.22, 1, 0.36, 1];

const ADVANCE_PANEL_MOTION = {
    initial: {
        opacity: 0,
        y: -6,
        scaleY: 0.97,
    },
    animate: {
        opacity: 1,
        y: 0,
        scaleY: 1,
        transition: {
            duration: 0.22,
            ease: ADVANCE_PANEL_MOTION_EASE,
            opacity: { duration: 0.16, ease: 'easeOut' },
            y: { duration: 0.22, ease: ADVANCE_PANEL_MOTION_EASE },
            scaleY: { duration: 0.22, ease: ADVANCE_PANEL_MOTION_EASE },
        },
    },
    exit: {
        opacity: 0,
        y: -4,
        scaleY: 0.98,
        transition: {
            duration: 0.15,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.12, ease: 'easeIn' },
        },
    },
};

/** Read v1 `{ v, filters, nameChipSource }` or legacy flat filter object. */
function parsePersistedAdvanceSearchBlob(raw, initialActiveFilters, persistMergeOmitKeys, filterConfig) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return { filters: {}, nameChipSource: 'none' };
    }
    if (!parsed || typeof parsed !== 'object') {
        return { filters: {}, nameChipSource: 'none' };
    }
    if (parsed.v === ADVANCE_SEARCH_PERSIST_FORMAT_V1 && parsed.filters && typeof parsed.filters === 'object') {
        let merged = mergePersistedActiveFiltersWithInitial(
            parsed.filters,
            initialActiveFilters,
            persistMergeOmitKeys,
        );
        const src = parsed.nameChipSource;
        const nameChipSource = src === 'advanced' ? 'advanced' : 'none';
        if (nameChipSource !== 'advanced') {
            merged = omitNonPersistedMainBarSearchKeysFromPersistSnapshot(merged, filterConfig);
        }
        return { filters: merged, nameChipSource };
    }
    const merged = mergePersistedActiveFiltersWithInitial(parsed, initialActiveFilters, persistMergeOmitKeys);
    const stripped = omitNonPersistedMainBarSearchKeysFromPersistSnapshot(merged, filterConfig);
    return { filters: stripped, nameChipSource: 'none' };
}

function buildPersistedAdvanceSearchPayload(activeFilters, filterConfig, communicationNameChipSource, persistMergeOmitKeys) {
    const withoutInputs = omitNonPersistedMainBarSearchKeysFromPersistSnapshot({ ...activeFilters }, filterConfig);
    if (Array.isArray(persistMergeOmitKeys)) {
        persistMergeOmitKeys.forEach((k) => {
            if (k != null && k !== '') delete withoutInputs[k];
        });
    }
    const filters =
        communicationNameChipSource === 'advanced' && activeFilters?.communication_name
            ? { ...withoutInputs, communication_name: activeFilters.communication_name }
            : withoutInputs;
    return {
        v: ADVANCE_SEARCH_PERSIST_FORMAT_V1,
        filters,
        nameChipSource: communicationNameChipSource === 'advanced' ? 'advanced' : 'none',
    };
}


const TRAILING_SUPPLEMENTAL_FILTER_TAG_KEYS = new Set([
    'listing_communication_name',
    'gallery_communication_name',
    'analytics_communication_name',
    'audience_list_name_search',
]);

const normalizeChipLabel = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

export {
    isEntireMultiSelectChosen,
    resolveAutoSuggestLabel,
    buildAdvanceSearchPersistStorageKey,
    hasPersistedAdvanceFilters,
    resolveMyCommunicationsScopeFromStorage,
} from './constant';

const RSAdvanceSearchNew = ({
    activeFilters: activeFiltersProp,
    searchPlaceholder: _searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
    onSearch = () => { },
    onSearchChange = () => { },
    onRefresh = () => { },
    onClear = () => { },
    filterConfig = [],
    onFiltersChange = () => { },
    dateRangeComponent = null,

    auxiliaryRightControls = null,
    createButtonComponent = null,
    disabled = false,
    initialActiveFilters = null,
    initialActiveFiltersSeedKey,
    clearActiveFiltersOnSearchClose = true,
    activeFiltersRestoreOnSearchClose = null,

    supplementalFilterTags = [],

    onSearchExpandedChange,

    excludeActiveFilterTagKeys = DEFAULT_EXCLUDE_ACTIVE_FILTER_TAG_KEYS,
    includeExcludedTagsWhenAdvancedOpen = false,
    /** Gallery: sync top channel Kendo from advanced `channel_type` without `onFiltersChange` (avoids list refetch + remount). */
    onAdvancePanelChannelTypeRowSync,

    searchSuggestions,
    searchSuggestionsLoading = false,
    onSearchSuggestionPick,

    communicationNameSuggestions = [],

    communicationNameSuggestionsLoading = false,

    onCommunicationNameSuggestionPick,

    searchValueSync = null,

    getSuggestionLabel = null,

    suggestionLabelKeys = null,

    minCharsForSearchSubmit = undefined,

    persistActiveFilters = false,

    persistActiveFiltersStorageKey = null,

    persistMergeOmitKeys = undefined,
    getTagDisplayOverride = null,

    showActiveFilterTagsWhenCollapsed: _showActiveFilterTagsWhenCollapsed = false,

    hideCollapsedSearchQuerySummary: _hideCollapsedSearchQuerySummary = false,

    lockMainBarWhenFilterChipsPresent = false,

    onAdvanceCommunicationNameSearchChange,

    onAdvanceCommunicationNameSuggestDismiss,
    onSearchTypeChange = () => { },
    disabledAdvanceOptions = [],
    advanceSearchOptions = [
        'Communication name',
        'Communication type',
        'Channel type',
        'Delivery type',
        'Product type',
        'Status',
    ]
}) => {
    const persistHydrationRef = useRef(null);
    const [searchValue, setSearchValue] = useState('');
    const activeFiltersRef = useRef({});
    const [activeFilters, setActiveFilters] = useState(() => {
        persistHydrationRef.current = { nameChipSource: 'none' };
        if (persistActiveFilters && persistActiveFiltersStorageKey) {
            try {
                const raw = localStorage.getItem(persistActiveFiltersStorageKey);
                if (raw) {
                    const { filters, nameChipSource } = parsePersistedAdvanceSearchBlob(
                        raw,
                        initialActiveFilters,
                        persistMergeOmitKeys,
                        filterConfig,
                    );
                    if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
                        persistHydrationRef.current = { nameChipSource };
                        return filters;
                    }
                }
            } catch {
                /* ignore */
            }
        }
        if (
            initialActiveFilters &&
            typeof initialActiveFilters === 'object' &&
            Object.keys(initialActiveFilters).length > 0
        ) {
            return initialActiveFilters;
        }
        return {};
    });

    const commitActiveFilters = useCallback((next) => {
        activeFiltersRef.current = next;
        setActiveFilters(next);
    }, []);

    useLayoutEffect(() => {
        activeFiltersRef.current = activeFilters;
    }, [activeFilters]);

    useEffect(() => {
        if (activeFiltersProp !== undefined) {
            commitActiveFilters(activeFiltersProp);
        }
    }, [activeFiltersProp, commitActiveFilters]);

    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
    const [isAdvancedPanelExiting, setIsAdvancedPanelExiting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const blurTimeoutRef = useRef(null);
    const handleFocus = useCallback(() => {
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
        setIsFocused(true);
    }, []);
    const handleBlur = useCallback(() => {
        blurTimeoutRef.current = setTimeout(() => {
            setIsFocused(false);
        }, 200);
    }, []);
    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
        };
    }, []);
    /** Main bar name only → hide chip; value edited/applied from advanced panel → show chip. */
    const [communicationNameChipSource, setCommunicationNameChipSource] = useState(
        () => persistHydrationRef.current?.nameChipSource ?? 'none',
    );
    const advanceCommNameFieldDirtyRef = useRef(false);
    const [canScrollExpandedLeft, setCanScrollExpandedLeft] = useState(false);
    const [canScrollExpandedRight, setCanScrollExpandedRight] = useState(false);
    const [_canScrollCollapsedLeft, setCanScrollCollapsedLeft] = useState(false);
    const [_canScrollCollapsedRight, setCanScrollCollapsedRight] = useState(false);

    const [expandedChipRowOverflow, setExpandedChipRowOverflow] = useState(false);
    const [collapsedChipRowOverflow, setCollapsedChipRowOverflow] = useState(false);
    const [hideSelectedFilterSuggestions, setHideSelectedFilterSuggestions] = useState(false);
    const inputRef = useRef(null);

    const prevHadFilterTagsRef = useRef(false);
    const expandedScrollRef = useRef(null);

    const expandedChipsMeasureRef = useRef(null);
    const collapsedScrollRef = useRef(null);
    const collapsedChipsMeasureRef = useRef(null);

    const advanceSearchMountRef = useRef(null);
    const searchTopRowRef = useRef(null);
    const searchRightControlsRef = useRef(null);
    const searchClusterRef = useRef(null);
    const searchIconBoxRef = useRef(null);
    const searchCreateButtonRef = useRef(null);
    const topSearchPickedRowRef = useRef(null);
    const advancedPanelBaselineRef = useRef(null);
    const prevAdvancedPanelOpenForBaselineRef = useRef(false);
    const prevAdvancedPanelOpenForMotionRef = useRef(false);
    const initialActiveFiltersRef = useRef(initialActiveFilters);
    initialActiveFiltersRef.current = initialActiveFilters;

    const prevInitialActiveFiltersSeedKeyRef = useRef(undefined);
    const [searchType, setSearchType] = useState(advanceSearchOptions?.[0] || '')
    const [searchBarWidthPx, setSearchBarWidthPx] = useState(0);

    const suggestionLabelOptions = useMemo(
        () => ({ getLabel: getSuggestionLabel, extraKeys: suggestionLabelKeys }),
        [getSuggestionLabel, suggestionLabelKeys],
    );

    const resolvedSuggestions = searchSuggestions ?? communicationNameSuggestions ?? [];
    const resolvedSuggestionsLoading = Boolean(
        searchSuggestionsLoading ?? communicationNameSuggestionsLoading ?? false,
    );
    const resolvedOnSuggestionPick =
        onSearchSuggestionPick ?? onCommunicationNameSuggestionPick ?? (() => { });

    const trimmedSearchValue = String(searchValue).trim();
    const normalizedSearchType = String(searchType || '').trim().toLowerCase();
    const selectedSearchFilter = useMemo(
        () =>
            filterConfig.find(
                (filter) => String(filter?.label || '').trim().toLowerCase() === normalizedSearchType,
            ),
        [filterConfig, normalizedSearchType],
    );
    const isCommunicationNameSearchType =
        !selectedSearchFilter ||
        selectedSearchFilter.key === 'communication_name' ||
        normalizedSearchType === 'communication name' ||
        normalizedSearchType === 'list name';

    /** Any screen with a communication/list name text field: main-bar search must not become a chip (listing, gallery, analytics, audience). */
    const hasCommunicationNameInputFilter = useMemo(
        () => filterConfig.some((f) => f?.key === 'communication_name' && f?.type === 'input'),
        [filterConfig],
    );
    /** e.g. Audience "List name" vs Communication "Communication name" — drives advanced-open main bar placeholder. */
    const nameInputFilterLabel = useMemo(() => {
        const f = filterConfig.find((x) => x?.key === 'communication_name' && x?.type === 'input');
        const label = String(f?.label ?? 'Communication name').trim();
        return label || 'Communication name';
    }, [filterConfig]);
    const searchNameInputPlaceholderWhenAdvancedOpen = useMemo(
        () => `Search ${nameInputFilterLabel.toLowerCase()}`,
        [nameInputFilterLabel],
    );
    const effectiveExcludeActiveFilterTagKeys = useMemo(() => {
        const baseExclude = [...(excludeActiveFilterTagKeys || [])];
        let raw;
        if (!hasCommunicationNameInputFilter) {
            raw = baseExclude;
        } else if (communicationNameChipSource !== 'advanced') {
            raw = [...baseExclude];
            if (!raw.includes('communication_name')) {
                raw.push('communication_name');
            }
        } else {
            raw = baseExclude.filter((k) => k !== 'communication_name');
        }
        /**
         * Gallery (and similar): hide `channel_type` from the chip row when advanced is closed so it does not
         * duplicate the top channel dropdown — but show it as an active chip while the advanced panel is open.
         */
        if (includeExcludedTagsWhenAdvancedOpen && isAdvancedPanelOpen) {
            const unhideWhileAdvanced = new Set(
                baseExclude.filter((k) => k !== 'communication_name'),
            );
            return raw.filter((k) => !unhideWhileAdvanced.has(k));
        }
        return raw;
    }, [
        excludeActiveFilterTagKeys,
        hasCommunicationNameInputFilter,
        communicationNameChipSource,
        includeExcludedTagsWhenAdvancedOpen,
        isAdvancedPanelOpen,
    ]);

    /** Plain main-bar name search — no “Communication name: …” / “List name: …” chip. */
    const communicationNameExcludedFromChipTags =
        Array.isArray(effectiveExcludeActiveFilterTagKeys) &&
        effectiveExcludeActiveFilterTagKeys.includes('communication_name');

    const communicationNameFilterText = useMemo(
        () =>
            String(
                activeFilters?.communication_name?.rawValue ??
                activeFilters?.communication_name?.displayValue ??
                '',
            ).trim(),
        [activeFilters?.communication_name],
    );
    const mainSearchBarDisplayValue = useMemo(() => {
        if (!communicationNameFilterText) return searchValue;
        if (communicationNameExcludedFromChipTags) {
            const svTrim = String(searchValue ?? '').trim();
            if (svTrim) return searchValue;
            return communicationNameFilterText;
        }
        if (String(searchValue ?? '').trim() === communicationNameFilterText) return '';
        return searchValue;
    }, [searchValue, communicationNameFilterText, communicationNameExcludedFromChipTags]);

    useLayoutEffect(() => {
        if (disabled) return;
        if (!isAdvancedPanelOpen) {
            prevAdvancedPanelOpenForBaselineRef.current = false;
            return;
        }
        if (!prevAdvancedPanelOpenForBaselineRef.current || !advancedPanelBaselineRef.current) {
            advancedPanelBaselineRef.current = {
                filters: cloneAdvanceFiltersDeep(activeFilters),
                communicationNameChipSource,
                searchValue,
            };
        }
        prevAdvancedPanelOpenForBaselineRef.current = true;
    }, [isAdvancedPanelOpen, disabled, activeFilters, communicationNameChipSource, searchValue]);


    const advanceInputFormValues = useMemo(() => {
        const o = {};
        filterConfig.forEach((f) => {
            if (f.type === 'input') {
                o[f.key] = String(activeFilters[f.key]?.rawValue ?? '');
            }
        });
        return o;
    }, [filterConfig, activeFilters]);

    const { control: advanceTextControl } = useForm({
        values: advanceInputFormValues,
    });

    const multiFilterChipTags = useMemo(
        () =>
            buildAdvanceFilterChipTagsList({
                activeFilters,
                filterConfig,
                excludeActiveFilterTagKeys: effectiveExcludeActiveFilterTagKeys || [],
                getTagDisplayOverride,
            }),
        [activeFilters, effectiveExcludeActiveFilterTagKeys, filterConfig, getTagDisplayOverride],
    );

    /**
     * Listing (multi `channel_type`): chip text follows `displayValue`; `rawValue` can be empty, stale, or wrong
     * order vs. the chip — `RSMultiSelectNew` only reads `rawValue`. Re-bind rows from `filterConfig.data` to match
     * `displayValue` whenever they disagree.
     */
    useEffect(() => {
        if (disabled) return;
        const channelCfg = filterConfig.find(
            (f) => f.key === 'channel_type' && f.isMulti && Array.isArray(f.data) && f.data.length > 0,
        );
        if (!channelCfg) return;
        const entry = activeFilters?.channel_type;
        if (!entry) return;
        const disp = String(entry.displayValue ?? '').trim();
        if (!disp) return;
        const field = channelCfg.fieldKey || 'name';
        const parts = disp
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        const rowsFromDisp = parts
            .map((n) =>
                channelCfg.data.find((row) => String(_get(row, field, '')).trim().toLowerCase() === n.toLowerCase()),
            )
            .filter(Boolean);
        if (!rowsFromDisp.length) return;
        const raw = entry.rawValue;
        const sameIds =
            Array.isArray(raw) &&
            raw.length === rowsFromDisp.length &&
            rowsFromDisp.every((r, i) => Number(r?.id) === Number(raw[i]?.id));
        if (sameIds) return;
        setActiveFilters((prev) => {
            const cur = prev?.channel_type;
            if (!cur) return prev;
            return {
                ...prev,
                channel_type: {
                    ...cur,
                    rawValue: rowsFromDisp,
                },
            };
        });
    }, [disabled, filterConfig, activeFilters?.channel_type]);

    const allChipTags = useMemo(() => {
        const raw = supplementalFilterTags || [];
        const leading = raw.filter((t) => !TRAILING_SUPPLEMENTAL_FILTER_TAG_KEYS.has(t.key));
        const trailing = raw.filter((t) => TRAILING_SUPPLEMENTAL_FILTER_TAG_KEYS.has(t.key));
        const mapSupp = (t) => ({
            key: `supp-${t.key}`,
            filterKey: null,
            label: t.label,
            displayValue: t.displayValue,
            onRemove: t.onRemove,
        });
        return [...leading.map(mapSupp), ...multiFilterChipTags, ...trailing.map(mapSupp)];
    }, [multiFilterChipTags, supplementalFilterTags]);


    const hasActiveFilterTags = allChipTags.length > 0;

    const hasMultiFilterChips = multiFilterChipTags.length > 0;


    /** Main bar: hide name suggestions when any advance filter chip is visible (not only sort default). */
    const suppressMainBarAutosuggest = useMemo(() => {
        if (isAdvancedPanelOpen) return true;
        if (isCommunicationNameSearchType && hasMultiFilterChips) return true;
        if (isCommunicationNameSearchType) return false;
        return hasBlockingAdvanceFilterChips(multiFilterChipTags);
    }, [isAdvancedPanelOpen, isCommunicationNameSearchType, hasMultiFilterChips, multiFilterChipTags]);

    const suggestionMinChars = parseMinCharsForSearchSubmit(minCharsForSearchSubmit);
    const meetsSuggestionThreshold = meetsSuggestionCharsThreshold(trimmedSearchValue, suggestionMinChars);


    const sawSuggestionsLoadingForQueryRef = useRef(false);
    const prevTrimmedForSuggestRef = useRef(trimmedSearchValue);
    if (prevTrimmedForSuggestRef.current !== trimmedSearchValue) {
        prevTrimmedForSuggestRef.current = trimmedSearchValue;
        sawSuggestionsLoadingForQueryRef.current = false;
    }
    useEffect(() => {
        if (resolvedSuggestionsLoading) {
            sawSuggestionsLoadingForQueryRef.current = true;
        }
    }, [resolvedSuggestionsLoading]);

    const suggestionCount = resolvedSuggestions?.length ?? 0;
    const { showSuggestionsNoResults, showSuggestionPanel } = getSuggestionPanelVisibility({
        resolvedSuggestionsLoading,
        suggestionCount,
        meetsSuggestionThreshold,
        sawSuggestionsLoadingForQuery: sawSuggestionsLoadingForQueryRef.current,
    });


    const showNameSuggestionList =
        isCommunicationNameSearchType &&
        showSuggestionPanel &&
        meetsSuggestionThreshold &&
        !suppressMainBarAutosuggest;

    const selectedFilterSuggestionRows = useMemo(() => {
        if (isCommunicationNameSearchType || isAdvancedPanelOpen || suppressMainBarAutosuggest) return [];
        const query = String(mainSearchBarDisplayValue || '').trim().toLowerCase();
        if (!query || !meetsSuggestionThreshold) return [];
        const data = Array.isArray(selectedSearchFilter?.data) ? selectedSearchFilter.data : [];
        return data.filter((row) => {
            const value = selectedSearchFilter?.isObject
                ? _get(row, selectedSearchFilter?.fieldKey || 'name', '')
                : row;
            return String(value ?? '').trim().toLowerCase().includes(query);
        });
    }, [
        isAdvancedPanelOpen,
        isCommunicationNameSearchType,
        mainSearchBarDisplayValue,
        meetsSuggestionThreshold,
        selectedSearchFilter,
        suppressMainBarAutosuggest,
    ]);
    const showSelectedFilterSuggestionList =
        !isCommunicationNameSearchType &&
        !isAdvancedPanelOpen &&
        !suppressMainBarAutosuggest &&
        !hideSelectedFilterSuggestions &&
        String(mainSearchBarDisplayValue || '').trim() &&
        meetsSuggestionThreshold;


    const advanceCommNameTrimmed = String(activeFilters?.communication_name?.rawValue ?? '').trim();
    const meetsAdvanceCommSuggestThreshold = meetsSuggestionCharsThreshold(
        advanceCommNameTrimmed,
        suggestionMinChars,
    );
    const sawAdvanceSuggestLoadingForQueryRef = useRef(false);
    const prevAdvanceCommTrimForSuggestRef = useRef(advanceCommNameTrimmed);
    if (prevAdvanceCommTrimForSuggestRef.current !== advanceCommNameTrimmed) {
        prevAdvanceCommTrimForSuggestRef.current = advanceCommNameTrimmed;
        sawAdvanceSuggestLoadingForQueryRef.current = false;
    }
    useEffect(() => {
        if (resolvedSuggestionsLoading) {
            sawAdvanceSuggestLoadingForQueryRef.current = true;
        }
    }, [resolvedSuggestionsLoading]);
    const {
        showSuggestionsNoResults: showAdvanceSuggestionsNoResults,
        showSuggestionPanel: showAdvanceSuggestionPanel,
    } = getSuggestionPanelVisibility({
        resolvedSuggestionsLoading,
        suggestionCount,
        meetsSuggestionThreshold: meetsAdvanceCommSuggestThreshold,
        sawSuggestionsLoadingForQuery: sawAdvanceSuggestLoadingForQueryRef.current,
    });
    const showAdvanceCommNameSuggestList =
        typeof onAdvanceCommunicationNameSearchChange === 'function' &&
        isAdvancedPanelOpen &&
        showAdvanceSuggestionPanel &&
        meetsAdvanceCommSuggestThreshold;

    const showMainBarSearchLoading =
        !suppressMainBarAutosuggest &&
        meetsSuggestionThreshold &&
        resolvedSuggestionsLoading &&
        !(resolvedSuggestions?.length > 0);

    const showAdvanceInputLoading =
        isAdvancedPanelOpen &&
        resolvedSuggestionsLoading &&
        !(resolvedSuggestions?.length > 0) &&
        meetsAdvanceCommSuggestThreshold;

    const shouldSubmitSearch = useCallback(
        (raw) => shouldAllowSearchSubmit(raw, minCharsForSearchSubmit),
        [minCharsForSearchSubmit],
    );

    const getEffectiveCommittedName = useCallback(() => {
        const fromFilter = String(
            activeFilters?.communication_name?.rawValue ?? activeFilters?.communication_name?.displayValue ?? '',
        ).trim();
        const fromMain = String(searchValue ?? '').trim();
        if (communicationNameExcludedFromChipTags) {
            const visible = String(mainSearchBarDisplayValue ?? '').trim();
            return visible || fromMain || fromFilter;
        }
        return fromFilter || fromMain;
    }, [
        activeFilters,
        searchValue,
        communicationNameExcludedFromChipTags,
        mainSearchBarDisplayValue,
    ]);

    /**
     * Main-bar typing keeps text in `searchValue`; advance chips use `activeFilters.communication_name`.
     * On Enter / Search, parents (e.g. audience lists) build API state from `onFiltersChange` only — without
     * this merge, `communication_name_text` is empty and the follow-up update clears the search.
     */
    const mergeCommittedNameIntoActiveFiltersForSubmit = useCallback(
        (committedNameForSync) => {
            if (!isCommunicationNameSearchType || filterConfig.length === 0) {
                return activeFiltersRef.current;
            }
            const name = String(committedNameForSync ?? '').trim();
            const next = { ...activeFiltersRef.current };
            if (name) {
                next.communication_name = { displayValue: name, rawValue: name };
            } else {
                delete next.communication_name;
            }
            activeFiltersRef.current = next;
            return next;
        },
        [filterConfig.length, isCommunicationNameSearchType],
    );

    const submitClearedListNameSearch = useCallback(() => {
        const nextFilters = { ...activeFiltersRef.current };
        delete nextFilters.communication_name;
        commitActiveFilters(nextFilters);
        setCommunicationNameChipSource('none');
        advanceCommNameFieldDirtyRef.current = false;
        onSearch('', { type: searchType, isAdvanceSearch: false });
    }, [commitActiveFilters, onSearch, searchType]);

    const handleFilterTextChange = useCallback(
        (filterKey, value) => {
            if (disabled) return;
            const str = String(value ?? '');
            const trimmed = str.trim();
            const updatedFilters = { ...activeFiltersRef.current };
            if (!trimmed) {
                delete updatedFilters[filterKey];
            } else {
                updatedFilters[filterKey] = { displayValue: trimmed, rawValue: str };
            }
            commitActiveFilters(updatedFilters);
            if (filterKey === 'communication_name' && hasCommunicationNameInputFilter) {
                advanceCommNameFieldDirtyRef.current = true;
                if (trimmed) {
                    setCommunicationNameChipSource('advanced');
                } else {
                    setCommunicationNameChipSource('none');
                }
            }
            if (filterKey === 'communication_name' && typeof onAdvanceCommunicationNameSearchChange === 'function') {
                onAdvanceCommunicationNameSearchChange(str);
            }
        },
        [activeFilters, disabled, hasCommunicationNameInputFilter, onAdvanceCommunicationNameSearchChange],
    );


    const handleSearchCollapse = () => {
        setIsAdvancedPanelOpen(false);
        setIsFocused(false);
        if (hasActiveFilterTags) {
            setIsSearchExpanded(true);
            return;
        }
        setIsSearchExpanded(false);
    };

    const applyAfterSearchSubmit = (committedName, wasAdvancedPanel) => {
        if (hasCommunicationNameInputFilter) {
            const t = String(committedName ?? '').trim();
            let nextSrc = communicationNameChipSource;
            if (wasAdvancedPanel) {
                if (!t) {
                    nextSrc = 'none';
                } else if (advanceCommNameFieldDirtyRef.current) {
                    nextSrc = 'advanced';
                } else {
                    nextSrc = communicationNameChipSource === 'advanced' ? 'advanced' : 'main';
                }
                advanceCommNameFieldDirtyRef.current = false;
            } else {
                nextSrc = t ? 'main' : 'none';
            }
            setCommunicationNameChipSource(nextSrc);
            const nameChipExcludedNext = nextSrc !== 'advanced';
            setSearchValue(nameChipExcludedNext && t ? committedName : '');
            return;
        }
        setSearchValue(
            communicationNameExcludedFromChipTags
                ? committedName
                : communicationNameFilterText
                    ? ''
                    : committedName,
        );
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        const trimmed = String(value).trim();
        const meetsNameSuggest = meetsSuggestionCharsThreshold(trimmed, suggestionMinChars);

        if (!lockMainBarWhenFilterChipsPresent && isAdvancedPanelOpen && meetsNameSuggest) {
            setIsAdvancedPanelOpen(false);
        }
        topSearchPickedRowRef.current = null;
        setHideSelectedFilterSuggestions(false);

        if (
            isCommunicationNameSearchType &&
            hasCommunicationNameInputFilter &&
            communicationNameExcludedFromChipTags
        ) {
            const filterName = String(
                activeFilters?.communication_name?.rawValue ??
                activeFilters?.communication_name?.displayValue ??
                '',
            ).trim();
            if (filterName && value !== filterName) {
                const next = { ...activeFilters };
                delete next.communication_name;
                setCommunicationNameChipSource('none');
                setActiveFilters(next);
                if (filterConfig.length > 0) {
                    onFiltersChange(next, { syncFiltersOnly: true });
                }
            }
        }

        setSearchValue(value);
        if (!value) {
            setIsSearchExpanded(true);
        }
        if (isCommunicationNameSearchType) {
            onSearchChange(value, searchType);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (disabled) return;
            if (!isCommunicationNameSearchType && selectedFilterSuggestionRows.length > 0) {
                e.preventDefault();
                const matchedRow = selectedFilterSuggestionRows[0];
                handleSelectedFilterSuggestionPick(matchedRow);
                handleSearchCollapse();
                return;
            }
            const committedName = isCommunicationNameSearchType
                ? getEffectiveCommittedName()
                : String(searchValue ?? '').trim();
            const trimmedCommitted = String(committedName ?? '').trim();
            if (isCommunicationNameSearchType && !trimmedCommitted && !hasActiveFilterTags) {
                e.preventDefault();
                sawSuggestionsLoadingForQueryRef.current = false;
                sawAdvanceSuggestLoadingForQueryRef.current = false;
                submitClearedListNameSearch();
                applyAfterSearchSubmit('', false);
                handleSearchCollapse();
                return;
            }
            const nameOk = shouldSubmitSearch(committedName);
            if (
                shouldSkipSearchSubmitDueToInertState(activeFilters, nameOk, hasActiveFilterTags)
            ) {
                return;
            }
            e.preventDefault();
            const wasAdvanced = isAdvancedPanelOpen;
            sawSuggestionsLoadingForQueryRef.current = false;
            sawAdvanceSuggestLoadingForQueryRef.current = false;
            const filtersForParent = mergeCommittedNameIntoActiveFiltersForSubmit(committedName);
            onSearch(committedName, {
                type: searchType,
                isAdvanceSearch: wasAdvanced,
                skipListNameClearOnEmpty: wasAdvanced && !trimmedCommitted,
            });
            if ((isCommunicationNameSearchType || wasAdvanced) && filterConfig.length > 0) {
                onFiltersChange(filtersForParent, { forceSubmit: true, isAdvanceSearch: wasAdvanced });
            }
            applyAfterSearchSubmit(committedName, wasAdvanced);
            handleSearchCollapse();
            if (wasAdvanced) {
                advancedPanelBaselineRef.current = null;
            }
        }
    };

    const handleSearchSubmit = () => {
        if (disabled) return;
        if (!isCommunicationNameSearchType && selectedFilterSuggestionRows.length > 0) {
            const matchedRow = selectedFilterSuggestionRows[0];
            handleSelectedFilterSuggestionPick(matchedRow);
            handleSearchCollapse();
            return;
        }
        const wasAdvanced = isAdvancedPanelOpen;
        const committedName = isCommunicationNameSearchType
            ? getEffectiveCommittedName()
            : String(searchValue ?? '').trim();
        const trimmedCommitted = String(committedName ?? '').trim();
        if (isCommunicationNameSearchType && !trimmedCommitted && !hasActiveFilterTags) {
            sawSuggestionsLoadingForQueryRef.current = false;
            sawAdvanceSuggestLoadingForQueryRef.current = false;
            submitClearedListNameSearch();
            applyAfterSearchSubmit('', false);
            handleSearchCollapse();
            return;
        }
        const nameOk = shouldSubmitSearch(committedName);
        if (shouldSkipSearchSubmitDueToInertState(activeFilters, nameOk, hasActiveFilterTags)) {
            return;
        }
        sawSuggestionsLoadingForQueryRef.current = false;
        sawAdvanceSuggestLoadingForQueryRef.current = false;
        const filtersForParent = mergeCommittedNameIntoActiveFiltersForSubmit(committedName);
        onSearch(committedName, {
            type: searchType,
            isAdvanceSearch: wasAdvanced,
            skipListNameClearOnEmpty: wasAdvanced && !trimmedCommitted,
        });
        if ((isCommunicationNameSearchType || wasAdvanced) && filterConfig.length > 0) {
            onFiltersChange(filtersForParent, { forceSubmit: true, isAdvanceSearch: wasAdvanced });
        }
        applyAfterSearchSubmit(committedName, wasAdvanced);
        handleSearchCollapse();
        if (wasAdvanced) {
            advancedPanelBaselineRef.current = null;
        }
    };


    const notifyParentAfterFilterChipChange = useCallback(
        (updatedFilters, syncMeta = {}) => {
            if (disabled) return;
            const fromFilter = String(
                updatedFilters?.communication_name?.rawValue ??
                updatedFilters?.communication_name?.displayValue ??
                '',
            ).trim();

            const { listNameChipCleared = false } = syncMeta;
            const nameToSend = listNameChipCleared
                ? fromFilter
                : String(fromFilter || String(searchValue ?? '').trim()).trim();
            if (listNameChipCleared) {
                setSearchValue('');
                onSearchChange('');
            }
            if (filterConfig.length > 0) {
                onFiltersChange(updatedFilters);
            }
            onSearch(nameToSend);
        },
        [disabled, filterConfig.length, onFiltersChange, onSearch, onSearchChange, searchValue],
    );

    const handleAdvanceCommunicationNameSuggestPick = useCallback(
        (pickedLabel) => {
            if (disabled) return;
            const picked = String(pickedLabel ?? '').trim();
            if (hasCommunicationNameInputFilter) {
                advanceCommNameFieldDirtyRef.current = true;
                setCommunicationNameChipSource(picked ? 'advanced' : 'none');
            }
            const updatedFilters = {
                ...activeFilters,
                communication_name: { displayValue: picked, rawValue: picked },
            };
            setActiveFilters(updatedFilters);

            if (!isAdvancedPanelOpen) {
                notifyParentAfterFilterChipChange(updatedFilters);
            }
            onAdvanceCommunicationNameSuggestDismiss?.();
        },
        [
            activeFilters,
            disabled,
            hasCommunicationNameInputFilter,
            isAdvancedPanelOpen,
            notifyParentAfterFilterChipChange,
            onAdvanceCommunicationNameSuggestDismiss,
        ],
    );


    const migrateMainBarToAdvanceCommunicationName = useCallback(() => {
        if (disabled) return;
        if (isCommunicationNameSearchType) {
            /**
             * Listing clears `searchValue` via `searchValueSync` when Enter merges the same text into
             * `activeFilters.communication_name` — the bar still shows the query via `mainSearchBarDisplayValue`.
             * Use the effective committed/visible name so opening Advanced still promotes the chip.
             */
            const trim = String(getEffectiveCommittedName() ?? '').trim();
            if (!trim) return;
            const fromChip = String(
                activeFilters?.communication_name?.rawValue ??
                activeFilters?.communication_name?.displayValue ??
                '',
            ).trim();
            if (trim === fromChip) {
                if (!communicationNameExcludedFromChipTags) {
                    setSearchValue('');
                    onSearchChange('');
                }
                if (hasCommunicationNameInputFilter && communicationNameExcludedFromChipTags && fromChip) {
                    advanceCommNameFieldDirtyRef.current = true;
                    setCommunicationNameChipSource('advanced');
                }
                topSearchPickedRowRef.current = null;
                return;
            }
            const updatedFilters = {
                ...activeFilters,
                communication_name: { displayValue: trim, rawValue: trim },
            };
            setActiveFilters(updatedFilters);
            if (hasCommunicationNameInputFilter && communicationNameExcludedFromChipTags) {
                advanceCommNameFieldDirtyRef.current = true;
                setCommunicationNameChipSource('advanced');
            }
            if (!communicationNameExcludedFromChipTags) {
                setSearchValue('');
                onSearchChange('');
            }
            topSearchPickedRowRef.current = null;
            onFiltersChange(updatedFilters);
            return;
        }
        const trim = String(searchValue ?? '').trim();
        if (!trim) return;
        if (!lockMainBarWhenFilterChipsPresent) return;
        const targetFilter = selectedSearchFilter;
        if (!targetFilter?.key) return;

        const existing = activeFilters?.[targetFilter.key];
        const fromFilter = String(existing?.displayValue ?? existing?.rawValue ?? '').trim();
        const data = Array.isArray(targetFilter.data) ? targetFilter.data : [];
        const pickedRow = topSearchPickedRowRef.current;
        const resolvedRow =
            pickedRow ??
            data.find((item) => {
                const label = targetFilter.isObject ? _get(item, targetFilter.fieldKey || 'name', '') : item;
                return String(label ?? '').trim().toLowerCase() === trim.toLowerCase();
            });
        if (!resolvedRow) return;
        const nextFilterValue = {
            displayValue: trim,
            rawValue: targetFilter.isMulti ? [resolvedRow] : resolvedRow,
        };
        const updatedFilters = {
            ...activeFilters,
            [targetFilter.key]: nextFilterValue,
        };
        setActiveFilters(updatedFilters);
        setSearchValue('');
        topSearchPickedRowRef.current = null;
        onSearchChange('');
        if (trim !== fromFilter) {
            onFiltersChange(updatedFilters);
        }
    }, [
        lockMainBarWhenFilterChipsPresent,
        disabled,
        searchValue,
        activeFilters,
        isCommunicationNameSearchType,
        selectedSearchFilter,
        onSearchChange,
        onFiltersChange,
        communicationNameExcludedFromChipTags,
        hasCommunicationNameInputFilter,
        getEffectiveCommittedName,
    ]);


    const handleClearSearchText = () => {
        setSearchValue('');
        onSearchChange('');
        setIsSearchExpanded(true);
        /**
         * Listing / gallery: after Enter, `communication_name` lives in `activeFilters` while the main bar
         * shows it via `mainSearchBarDisplayValue` fallback — clearing only `searchValue` leaves that text visible
         * and `buildSearchPayload` still reads `nameFromAdvanceFilter`. Strip merged name + one parent fetch.
         */
        let clearedMergedName = false;
        if (hasCommunicationNameInputFilter && communicationNameExcludedFromChipTags) {
            const nameInFilters = String(
                activeFilters?.communication_name?.rawValue ??
                activeFilters?.communication_name?.displayValue ??
                '',
            ).trim();
            if (nameInFilters) {
                const next = { ...activeFilters };
                delete next.communication_name;
                setCommunicationNameChipSource('none');
                setActiveFilters(next);
                if (filterConfig.length > 0) {
                    onFiltersChange(next);
                }
                clearedMergedName = true;
            }
        }
        if (!clearedMergedName) {
            onRefresh();
        }
    };

    const handleClear = () => {
        setSearchValue('');
        setActiveFilters({});
        advanceCommNameFieldDirtyRef.current = false;
        setCommunicationNameChipSource('none');
        advancedPanelBaselineRef.current = null;
        /** Parent `onClear` performs the authoritative reset + fetch (e.g. listing `buildClearPayload`). */
        onClear();
    };

    const handleClearActiveFilterTagsOnly = (keepPanelOpen = false, overrideSearchValue) => {
        if (disabled) return;
        onAdvanceCommunicationNameSuggestDismiss?.();
        advanceCommNameFieldDirtyRef.current = false;
        setCommunicationNameChipSource('none');
        const init = initialActiveFiltersRef.current;
        const next =
            init && typeof init === 'object' && Object.keys(init).length > 0 ? { ...init } : {};
        const trimmedBar = String(overrideSearchValue !== undefined ? overrideSearchValue : (searchValue ?? '')).trim();
        if (hasCommunicationNameInputFilter && trimmedBar) {
            next.communication_name = {
                rawValue: trimmedBar,
                displayValue: trimmedBar,
            };
        } else {
            delete next.communication_name;
        }
        setActiveFilters(next);
        if (!keepPanelOpen) {
            setIsAdvancedPanelOpen(false);
        }
        setIsSearchExpanded(true);
        if (filterConfig.length > 0) {
            onFiltersChange(next);
        }
    };


    const handleToolbarClear = () => {
        if (disabled) return;
        onAdvanceCommunicationNameSuggestDismiss?.();
        if (isAdvancedPanelOpen) {
            handleClear();
            return;
        }
        if (hasActiveFilterTags) {
            handleClearActiveFilterTagsOnly(false);
            return;
        }
        handleClearSearchText();
    };

    const hasSearchTextToClear = Boolean(
        String(mainSearchBarDisplayValue ?? '').trim() ||
        String(searchValue ?? '').trim() ||
        String(communicationNameFilterText ?? '').trim(),
    );
    const showToolbarClear = hasActiveFilterTags || hasSearchTextToClear;
    const toolbarClearTooltip = 'Clear';


    const trimmedMainBarForClose = String(mainSearchBarDisplayValue ?? '').trim();
    const showExpandedSearchClose = hasActiveFilterTags || Boolean(trimmedMainBarForClose);

    const handleSearchExpand = () => {
        if (disabled) return;
        const init = initialActiveFiltersRef.current;
        if (init && typeof init === 'object' && Object.keys(init).length > 0) {
            const next = { ...activeFilters };
            let changed = false;
            Object.keys(init).forEach((k) => {
                if (next[k] == null) {
                    next[k] = init[k];
                    changed = true;
                }
            });
            if (changed) {
                setActiveFilters(next);
                /** Listing keeps default `sort_type` in state — no list refetch until user applies real filters / search. */
                if (!shouldSkipSearchSubmitDueToInertState(next, false, false)) {
                    onFiltersChange(next);
                }
            }
        }
        setIsSearchExpanded(true);
    };

    const _handleOpenAdvancedFromCollapsed = () => {
        if (disabled) return;
        handleSearchExpand();
        advanceCommNameFieldDirtyRef.current = false;
        migrateMainBarToAdvanceCommunicationName();
        setIsAdvancedPanelOpen(true);
    };

    const handleSearchClose = () => {
        const hadFilterChips = hasActiveFilterTags;
        setIsAdvancedPanelOpen(false);
        setSearchValue('');
        onSearchChange('');
        setIsSearchExpanded(false);
        setIsFocused(false);
        const restore = activeFiltersRestoreOnSearchClose;
        if (
            restore &&
            typeof restore === 'object' &&
            Object.keys(restore).length > 0
        ) {
            setActiveFilters(restore);
            onFiltersChange(restore, { campaignNameOverride: '' });
            return;
        }
        if (clearActiveFiltersOnSearchClose) {
            const hasTypedSearch =
                Boolean(String(searchValue ?? '').trim()) ||
                Boolean(String(mainSearchBarDisplayValue ?? '').trim());
            const onlyDefaultSortAndEmptyUi =
                shouldSkipSearchSubmitDueToInertState(activeFilters, false, false) &&
                !hasActiveFilterTags &&
                !hasTypedSearch;
            if (!onlyDefaultSortAndEmptyUi) {
                advanceCommNameFieldDirtyRef.current = false;
                setCommunicationNameChipSource('none');
                setActiveFilters({});
                onClear();
                return;
            }
        }
        if (!hadFilterChips && hasCommunicationNameInputFilter) {
            submitClearedListNameSearch();
        }
    };

    useEffect(() => {
        if (hasActiveFilterTags && !isSearchExpanded && !isAdvancedPanelOpen) {
            setIsSearchExpanded(true);
        }
    }, [hasActiveFilterTags, isSearchExpanded, isAdvancedPanelOpen]);

    useEffect(() => {
        if (!isSearchExpanded) {
            setIsAdvancedPanelOpen(false);
        }
    }, [isSearchExpanded]);

    useEffect(() => {
        if (searchValueSync != null && typeof searchValueSync.rev === 'number') {
            setSearchValue(searchValueSync.value ?? '');
        }
    }, [searchValueSync?.rev]);

    useEffect(() => {
        onSearchExpandedChange?.(isSearchExpanded);
    }, [isSearchExpanded, onSearchExpandedChange]);

    useLayoutEffect(() => {
        if (isAdvancedPanelOpen) {
            setIsAdvancedPanelExiting(false);
        } else if (prevAdvancedPanelOpenForMotionRef.current) {
            setIsAdvancedPanelExiting(true);
        }
        prevAdvancedPanelOpenForMotionRef.current = isAdvancedPanelOpen;
    }, [isAdvancedPanelOpen]);

    useLayoutEffect(() => {
        const updateSearchBarWidth = () => {
            const topRowNode = searchTopRowRef.current;
            const searchIconNode = searchIconBoxRef.current;
            if (!topRowNode || !searchIconNode) return;

            const topRowStyle = window.getComputedStyle(topRowNode);
            const topRowGap = parseFloat(topRowStyle.columnGap || topRowStyle.gap || 0) || 0;
            const visibleSiblingWidths = [
                searchRightControlsRef.current,
                searchCreateButtonRef.current,
            ].reduce((totalWidth, node) => {
                if (!node) return totalWidth;
                const rect = node.getBoundingClientRect();
                return rect.width > 1 ? totalWidth + rect.width + topRowGap : totalWidth;
            }, 0);

            const nextWidth = Math.max(
                0,
                Math.floor(
                    topRowNode.getBoundingClientRect().width -
                    visibleSiblingWidths -
                    searchIconNode.getBoundingClientRect().width -
                    ADVANCE_SEARCH_CLUSTER_GAP_PX,
                ),
            );

            setSearchBarWidthPx((previousWidth) =>
                Math.abs(previousWidth - nextWidth) > 1 ? nextWidth : previousWidth,
            );
        };

        updateSearchBarWidth();

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateSearchBarWidth);
            if (searchTopRowRef.current) resizeObserver.observe(searchTopRowRef.current);
            if (searchRightControlsRef.current) resizeObserver.observe(searchRightControlsRef.current);
            if (searchClusterRef.current) resizeObserver.observe(searchClusterRef.current);
            if (searchIconBoxRef.current) resizeObserver.observe(searchIconBoxRef.current);
            if (searchCreateButtonRef.current) resizeObserver.observe(searchCreateButtonRef.current);
        }

        const rafId = requestAnimationFrame(updateSearchBarWidth);
        window.addEventListener('resize', updateSearchBarWidth);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', updateSearchBarWidth);
        };
    }, [isSearchExpanded]);

    const persistStorageKey =
        persistActiveFilters && persistActiveFiltersStorageKey && typeof persistActiveFiltersStorageKey === 'string'
            ? persistActiveFiltersStorageKey
            : null;
    useLayoutEffect(() => {
        if (!persistStorageKey) return;
        const init = initialActiveFiltersRef.current;
        let toNotify = activeFilters;
        let shouldNotifyParent = false;
        if (Object.keys(toNotify).length === 0 && init && typeof init === 'object' && Object.keys(init).length > 0) {
            toNotify = init;
            setActiveFilters(init);
            shouldNotifyParent = true;
        } else {
            try {
                if (hasPersistedAdvanceFilters(persistStorageKey)) {
                    shouldNotifyParent = true;
                } else if (
                    init &&
                    typeof init === 'object' &&
                    Object.keys(init).length > 0 &&
                    Object.keys(toNotify).length > 0
                ) {
                    shouldNotifyParent = true;
                }
            } catch {
                shouldNotifyParent = true;
            }
        }
        if (shouldNotifyParent) {

            let payload = toNotify;
            if (Array.isArray(persistMergeOmitKeys) && persistMergeOmitKeys.length > 0) {
                payload = { ...toNotify };
                persistMergeOmitKeys.forEach((k) => {
                    if (k != null && k !== '') {
                        if (init && init[k] !== undefined) {
                            payload[k] = init[k];
                        } else {
                            delete payload[k];
                        }
                    }
                });
                setActiveFilters(payload);
            }
            onFiltersChange(payload);
        }
    }, [persistStorageKey]);

    useEffect(() => {
        if (!persistStorageKey) return;
        try {
            if (!activeFilters || Object.keys(activeFilters).length === 0) {
                localStorage.removeItem(persistStorageKey);
                return;
            }
            const payload = buildPersistedAdvanceSearchPayload(
                activeFilters,
                filterConfig,
                communicationNameChipSource,
                persistMergeOmitKeys,
            );
            if (!payload.filters || Object.keys(payload.filters).length === 0) {
                localStorage.removeItem(persistStorageKey);
                return;
            }
            localStorage.setItem(persistStorageKey, JSON.stringify(payload));
        } catch {
        }
    }, [activeFilters, persistStorageKey, filterConfig, communicationNameChipSource, persistMergeOmitKeys]);

    useEffect(() => {
        if (persistActiveFilters && persistActiveFiltersStorageKey) {
            return;
        }
        const init = initialActiveFiltersRef.current;
        if (!init || typeof init !== 'object' || Object.keys(init).length === 0) {
            return;
        }
        const prevKey = prevInitialActiveFiltersSeedKeyRef.current;
        if (prevKey === undefined) {
            prevInitialActiveFiltersSeedKeyRef.current = initialActiveFiltersSeedKey;
            return;
        }
        prevInitialActiveFiltersSeedKeyRef.current = initialActiveFiltersSeedKey;
        if (prevKey === initialActiveFiltersSeedKey) {
            return;
        }
        setActiveFilters(init);
        onFiltersChange(init);
    }, [initialActiveFiltersSeedKey, persistActiveFilters, persistActiveFiltersStorageKey]);

    const handleFilterSelect = (filterKey, selectedValue) => {
        const filter = filterConfig.find((f) => f.key === filterKey);
        const rawLabel = filter?.isObject
            ? _get(selectedValue, filter?.fieldKey || 'name', '')
            : selectedValue;
        const displayValue = normalizeChipLabel(rawLabel);

        const updatedFilters = {
            ...activeFiltersRef.current,
            [filterKey]: { displayValue, rawValue: selectedValue },
        };
        commitActiveFilters(updatedFilters);
        if (isAdvancedPanelOpen && filterConfig.length > 0) {
            onFiltersChange(updatedFilters, { syncFiltersOnly: true });
        }
        if (
            isAdvancedPanelOpen &&
            includeExcludedTagsWhenAdvancedOpen &&
            filterKey === 'channel_type' &&
            typeof onAdvancePanelChannelTypeRowSync === 'function'
        ) {
            onAdvancePanelChannelTypeRowSync(selectedValue);
        }
    };

    const handleTagRemove = (key) => {
        const updatedFilters = { ...activeFilters };
        if (key === 'sort_type') {
            updatedFilters.sort_type = {
                ...DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE,
                rawValue: { ...DEFAULT_SORT_TYPE_ADVANCE_FILTER_VALUE.rawValue },
            };
        } else {
            delete updatedFilters[key];

            if (key === 'channel_type') {
                const ic = initialActiveFiltersRef.current?.channel_type;
                if (ic != null && typeof ic === 'object' && ic.rawValue != null) {
                    updatedFilters.channel_type = {
                        displayValue: ic.displayValue,
                        rawValue: ic.rawValue,
                    };
                }
            }
        }
        setActiveFilters(updatedFilters);
        if (key === 'communication_name' && hasCommunicationNameInputFilter) {
            advanceCommNameFieldDirtyRef.current = false;
            setCommunicationNameChipSource('none');
        }
        const reseededChannelType =
            key === 'channel_type' && updatedFilters.channel_type != null && typeof updatedFilters.channel_type === 'object';

        if (!isAdvancedPanelOpen || reseededChannelType) {
            notifyParentAfterFilterChipChange(updatedFilters, {
                listNameChipCleared: key === 'communication_name',
            });
        } else if (isAdvancedPanelOpen && filterConfig.length > 0) {
            /** Keep parent filter refs in sync for name-suggest APIs without a full list refetch. */
            onFiltersChange(updatedFilters, { syncFiltersOnly: true });
        }
    };

    const handleMultiFilterSelect = (filterKey, items, options = {}) => {
        const { notifyParent = false } = options;
        const filter = filterConfig.find((f) => f.key === filterKey);
        if (items.length === 0) {
            const updatedFilters = { ...activeFiltersRef.current };
            delete updatedFilters[filterKey];
            if (filterKey === 'channel_type') {
                const ic = initialActiveFiltersRef.current?.channel_type;
                if (ic != null && typeof ic === 'object' && ic.rawValue != null) {
                    updatedFilters.channel_type = {
                        displayValue: ic.displayValue,
                        rawValue: ic.rawValue,
                    };
                }
            }
            commitActiveFilters(updatedFilters);
            const reseededChannelType =
                filterKey === 'channel_type' &&
                updatedFilters.channel_type != null &&
                typeof updatedFilters.channel_type === 'object';
            if (notifyParent && (!isAdvancedPanelOpen || reseededChannelType)) {
                notifyParentAfterFilterChipChange(updatedFilters, {
                    listNameChipCleared: filterKey === 'communication_name',
                });
            } else if (isAdvancedPanelOpen && filterConfig.length > 0) {
                onFiltersChange(updatedFilters, { syncFiltersOnly: true });
            }
            return;
        }
        const allLabel = filter?.selectAllTagLabel ?? DEFAULT_SELECT_ALL_TAG_LABEL;
        const displayValue = isEntireMultiSelectChosen(filter, items)
            ? allLabel
            : items
                .map((item) => {
                    const v = filter?.isObject ? _get(item, filter?.fieldKey || 'name', '') : String(item);
                    return normalizeChipLabel(v);
                })
                .filter((s) => s !== '')
                .join(', ');
        const updatedFilters = {
            ...activeFiltersRef.current,
            [filterKey]: { displayValue, rawValue: items },
        };
        commitActiveFilters(updatedFilters);
        if (isAdvancedPanelOpen && filterConfig.length > 0) {
            /** Advanced multiselects are only interactive while the panel is open; parent refs must update for suggest APIs. */
            onFiltersChange(updatedFilters, { syncFiltersOnly: true });
        } else if (notifyParent && !isAdvancedPanelOpen) {
            notifyParentAfterFilterChipChange(updatedFilters);
        }
    };

    const handleSearchTypeSelect = (selectedType) => {
        if (disabled) return;
        setSearchType(selectedType);
        setSearchValue('');
        topSearchPickedRowRef.current = null;
        setHideSelectedFilterSuggestions(false);
        onSearchChange('', selectedType);
        onSearchTypeChange(selectedType);
        onAdvanceCommunicationNameSuggestDismiss?.();
    };

    const handleSelectedFilterSuggestionPick = (row) => {
        if (disabled || !selectedSearchFilter) return;
        const label = normalizeChipLabel(
            selectedSearchFilter.isObject
                ? _get(row, selectedSearchFilter.fieldKey || 'name', '')
                : row,
        );
        if (!label) return;

        setSearchValue(label);
        topSearchPickedRowRef.current = row;
        setHideSelectedFilterSuggestions(true);
        onSearchChange('', searchType);
        onSearch(label, { type: searchType, searchValue: row, isAdvanceSearch: false });
    };

    useEffect(() => {
        if (!searchType || !advanceSearchOptions?.includes(searchType)) {
            const defaultType = advanceSearchOptions?.[0] || '';
            setSearchType(defaultType);
            onSearchTypeChange(defaultType);
        }
    }, [advanceSearchOptions, onSearchTypeChange, searchType]);

    const updateScrollFlags = useCallback((node, setLeft, setRight, setOverflow) => {
        if (!node) {
            setLeft(false);
            setRight(false);
            setOverflow?.(false);
            return;
        }
        const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
        const epsilon = 1;
        setOverflow?.(maxScrollLeft > epsilon);
        setLeft(node.scrollLeft > epsilon);
        setRight(maxScrollLeft - node.scrollLeft > epsilon);
    }, []);

    useLayoutEffect(() => {
        const expandedNode = expandedScrollRef.current;
        const collapsedNode = collapsedScrollRef.current;
        const expandedChipsEl = expandedChipsMeasureRef.current;
        const collapsedChipsEl = collapsedChipsMeasureRef.current;

        const refreshExpanded = () =>
            updateScrollFlags(
                expandedNode,
                setCanScrollExpandedLeft,
                setCanScrollExpandedRight,
                setExpandedChipRowOverflow,
            );
        const refreshCollapsed = () =>
            updateScrollFlags(
                collapsedNode,
                setCanScrollCollapsedLeft,
                setCanScrollCollapsedRight,
                setCollapsedChipRowOverflow,
            );

        refreshExpanded();
        refreshCollapsed();
        let innerRaf;
        const raf1 = requestAnimationFrame(() => {
            refreshExpanded();
            refreshCollapsed();
            innerRaf = requestAnimationFrame(() => {
                refreshExpanded();
                refreshCollapsed();
            });
        });

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                refreshExpanded();
                refreshCollapsed();
            });
            if (expandedNode) resizeObserver.observe(expandedNode);
            if (collapsedNode) resizeObserver.observe(collapsedNode);
            if (expandedChipsEl) resizeObserver.observe(expandedChipsEl);
            if (collapsedChipsEl) resizeObserver.observe(collapsedChipsEl);
        }

        expandedNode?.addEventListener('scroll', refreshExpanded);
        collapsedNode?.addEventListener('scroll', refreshCollapsed);
        window.addEventListener('resize', refreshExpanded);
        window.addEventListener('resize', refreshCollapsed);

        return () => {
            cancelAnimationFrame(raf1);
            if (innerRaf) cancelAnimationFrame(innerRaf);
            resizeObserver?.disconnect();
            expandedNode?.removeEventListener('scroll', refreshExpanded);
            collapsedNode?.removeEventListener('scroll', refreshCollapsed);
            window.removeEventListener('resize', refreshExpanded);
            window.removeEventListener('resize', refreshCollapsed);
        };
    }, [
        activeFilters,
        filterConfig,
        searchValue,
        isSearchExpanded,
        isAdvancedPanelOpen,
        supplementalFilterTags,
        allChipTags,
        updateScrollFlags,
    ]);

    const scrollHorizontal = (nodeRef, direction) => {
        const node = nodeRef.current;
        if (!node) return;
        const amount = Math.max(120, Math.floor(node.clientWidth * 0.45));
        node.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    const discardAdvancedPanelDraft = useCallback(() => {
        const b = advancedPanelBaselineRef.current;
        setIsAdvancedPanelOpen(false);
        if (!b) return;
        const restoredFilters = cloneAdvanceFiltersDeep(b.filters);
        setActiveFilters(restoredFilters);
        setCommunicationNameChipSource(b.communicationNameChipSource);
        setSearchValue(b.searchValue ?? '');
        onSearchChange(b.searchValue ?? '', searchType);
        advanceCommNameFieldDirtyRef.current = false;
        onAdvanceCommunicationNameSuggestDismiss?.();
        const fromFilter = String(
            restoredFilters?.communication_name?.rawValue ??
            restoredFilters?.communication_name?.displayValue ??
            '',
        ).trim();
        const fromBar = String(b.searchValue ?? '').trim();
        let nameToSend = fromFilter || fromBar;
        if (hasCommunicationNameInputFilter) {
            nameToSend =
                b.communicationNameChipSource === 'advanced' && fromFilter
                    ? fromFilter
                    : fromBar || fromFilter;
        }
        onSearch(nameToSend, { type: searchType });
        if (filterConfig.length > 0) {
            onFiltersChange(restoredFilters, { forceSubmit: true });
        }
        advancedPanelBaselineRef.current = null;
    }, [
        filterConfig.length,
        hasCommunicationNameInputFilter,
        onAdvanceCommunicationNameSuggestDismiss,
        onFiltersChange,
        onSearch,
        onSearchChange,
        searchType,
    ]);

    const toggleAdvancedPanel = () => {
        if (disabled) return;
        if (isAdvancedPanelOpen) {
            discardAdvancedPanelDraft();
            return;
        }
        advanceCommNameFieldDirtyRef.current = false;
        migrateMainBarToAdvanceCommunicationName();
        setIsAdvancedPanelOpen(true);
    };

    const handleAdvancedCancel = () => {
        discardAdvancedPanelDraft();
    };


    // useEffect(() => {
    //     if (!isAdvancedPanelOpen || disabled) return;
    //     const onPointerDown = (event) => {
    //         const root = advanceSearchMountRef.current;
    //         if (!root || root.contains(event.target)) return;
    //         discardAdvancedPanelDraft();
    //     };
    //     document.addEventListener('pointerdown', onPointerDown, true);
    //     return () => document.removeEventListener('pointerdown', onPointerDown, true);
    // }, [isAdvancedPanelOpen, disabled, discardAdvancedPanelDraft]);

    const sortedAdvanceFilterConfig = useMemo(() => {
        const list = [...filterConfig];
        return list.sort((a, b) => {
            if (a.key === 'sort_type') return 1;
            if (b.key === 'sort_type') return -1;
            return 0;
        });
    }, [filterConfig]);
    const lockMainBarText = useMemo(() => {
        if (!lockMainBarWhenFilterChipsPresent) return false;
        if (isAdvancedPanelOpen) return true;
        if (!hasMultiFilterChips) return false;
        const onlyNonBlocking = multiFilterChipTags.every(
            (t) => !t.filterKey || MAIN_BAR_NON_BLOCKING_FILTER_KEYS.has(t.filterKey),
        );
        return !onlyNonBlocking;
    }, [lockMainBarWhenFilterChipsPresent, isAdvancedPanelOpen, hasMultiFilterChips, multiFilterChipTags]);
    const hideMainBarInputWhenChipsPresent = lockMainBarWhenFilterChipsPresent && hasActiveFilterTags;
    const _hasCollapsedSummary =
        hasActiveFilterTags || Boolean(String(mainSearchBarDisplayValue || '').trim()) || isFocused;

    const showExpandedChipScrollNav =
        hasActiveFilterTags && expandedChipRowOverflow;

    const _showCollapsedChipScrollNav = hasActiveFilterTags && collapsedChipRowOverflow;

    const canSubmitAdvancedFooterSearch = useMemo(() => {
        const committedName = getEffectiveCommittedName();
        const hasSearchText = committedName.trim() !== '';
        const nameOk = hasSearchText && shouldSubmitSearch(committedName);

        const hasAnyFilter = Object.entries(activeFilters || {}).some(([key, val]) => {
            if (key === 'sort_type') {
                const raw = val?.rawValue;
                const id =
                    raw != null && typeof raw === 'object' && !Array.isArray(raw)
                        ? Number(raw.id)
                        : Number(raw);
                return Number.isFinite(id) && id !== DEFAULT_ADVANCE_SEARCH_SORT_BY_ID;
            }
            if (!val) return false;
            const raw = val.rawValue;
            if (raw === undefined || raw === null) return false;
            if (typeof raw === 'string') return raw.trim() !== '';
            if (Array.isArray(raw)) return raw.length > 0;
            return true;
        });

        if (!hasAnyFilter && !nameOk) {
            return false;
        }

        return !shouldSkipSearchSubmitDueToInertState(activeFilters, nameOk, hasActiveFilterTags);
    }, [activeFilters, getEffectiveCommittedName, hasActiveFilterTags, shouldSubmitSearch]);


    const canClickToolbarZoomSearch = useMemo(() => {
        if (disabled) return false;
        if (suggestionMinChars == null) return true;
        const committedName = getEffectiveCommittedName();
        const nameOk = shouldSubmitSearch(committedName);
        if (hasActiveFilterTags || hasMultiFilterChips) return true;
        return !shouldSkipSearchSubmitDueToInertState(activeFilters, nameOk, hasActiveFilterTags);
    }, [
        disabled,
        suggestionMinChars,
        activeFilters,
        getEffectiveCommittedName,
        shouldSubmitSearch,
        hasMultiFilterChips,
        hasActiveFilterTags,
    ]);


    useEffect(() => {
        if (!lockMainBarWhenFilterChipsPresent) {
            prevHadFilterTagsRef.current = hasMultiFilterChips;
            return;
        }
        const prev = prevHadFilterTagsRef.current;
        prevHadFilterTagsRef.current = hasMultiFilterChips;
        if (!hasMultiFilterChips || prev) return;
        const onlyNonBlocking = multiFilterChipTags.every(
            (t) => !t.filterKey || MAIN_BAR_NON_BLOCKING_FILTER_KEYS.has(t.filterKey),
        );
        if (onlyNonBlocking) {
            return;
        }
        if (String(searchValue ?? '').trim()) {
            setSearchValue('');
            onSearchChange('');
        }
    }, [lockMainBarWhenFilterChipsPresent, hasMultiFilterChips, multiFilterChipTags, onSearchChange, searchValue]);

    useEffect(() => {
        if (!isSearchExpanded || !inputRef.current) return;
        if (lockMainBarText) return;
        inputRef.current.focus();
    }, [isSearchExpanded, lockMainBarText]);

    const handleTagRemoveFromChipRow = (tag) => {
        if (tag.onRemove) {
            tag.onRemove();
            return;
        }
        if (!tag.filterKey) return;
        const cfg = filterConfig.find((f) => f.key === tag.filterKey);
        const entry = activeFilters[tag.filterKey];
        if (cfg?.isMulti && Array.isArray(entry?.rawValue) && typeof tag.itemIndexToRemove === 'number') {
            const nextItems = entry.rawValue.filter((_, i) => i !== tag.itemIndexToRemove);
            handleMultiFilterSelect(tag.filterKey, nextItems, { notifyParent: true });
            return;
        }
        handleTagRemove(tag.filterKey);
    };

    const renderActiveFilterChips = () =>
        allChipTags.map((tag, index) => {
            const prev = allChipTags[index - 1];
            const shouldShowLabel =
                index === 0 ||
                (prev?.filterKey !== tag.filterKey && prev?.label !== tag.label) ||
                (prev?.filterKey == null && tag.filterKey == null && prev?.label !== tag.label);
            return (
                <span key={tag.key} className="rs-asn-filter-pair">
                    {shouldShowLabel && (
                        <span className="rs-asn-filter-pair-label">{tag.label}:</span>
                    )}
                    <span className="rs-asn-chip">
                        <span className="rs-asn-chip-value" title={tag.displayValue}>
                            {tag.displayValue}
                        </span>

                        <button
                            type="button"
                            title="Remove"
                            onClick={() => handleTagRemoveFromChipRow(tag)}
                            aria-label={`Remove ${tag.label} filter`}
                            disabled={disabled || tag.removable === false}
                            className={`${tag.removable === false ? 'click-off' : ''} rs-asn-chip-remove`}
                        >
                            <span className="rs-asn-chip-remove-icon" aria-hidden>
                                −
                            </span>
                        </button>

                    </span>
                </span>
            );
        });

    const renderCommunicationNameSuggestionList = () => {
        if (!showNameSuggestionList || isAdvancedPanelOpen) return null;
        return (
            <ul className="SP-SuggestionEmpty rs-asn-name-suggest-list test css-scrollbar" role="listbox" aria-label="Search suggestions">
                {showSuggestionsNoResults && (
                    <li className="rs-asn-name-suggest-item rs-asn-name-suggest-item--empty" role="status">
                        {SUGGESTION_LIST_EMPTY_LABEL}
                    </li>
                )}
                {!resolvedSuggestionsLoading &&
                    resolvedSuggestions.map((row, idx) => {
                        const label = resolveAutoSuggestLabel(row, suggestionLabelOptions);
                        if (!label) return null;
                        const stableId = STABLE_ROW_ID_KEYS.map((k) => row?.[k]).find(
                            (v) => v != null && v !== '',
                        );
                        const rowKey =
                            stableId != null ? `id-${String(stableId)}` : `${idx}-${label.slice(0, 64)}`;
                        return (
                            <li key={rowKey} className="rs-asn-name-suggest-item">
                                <div
                                    className="rs-asn-name-suggest-btn"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        const picked = String(label ?? '').trim();
                                        sawSuggestionsLoadingForQueryRef.current = false;
                                        sawAdvanceSuggestLoadingForQueryRef.current = false;
                                        resolvedOnSuggestionPick(picked);
                                        if (hasCommunicationNameInputFilter && isCommunicationNameSearchType) {
                                            advanceCommNameFieldDirtyRef.current = false;
                                            setCommunicationNameChipSource(String(picked ?? '').trim() ? 'main' : 'none');
                                        }
                                        if (
                                            communicationNameFilterText &&
                                            picked.trim() === communicationNameFilterText &&
                                            !communicationNameExcludedFromChipTags
                                        ) {
                                            setSearchValue('');
                                        } else {
                                            setSearchValue(picked);
                                        }
                                        setIsAdvancedPanelOpen(false);
                                        handleSearchCollapse();
                                    }}
                                >
                                    {label}
                                </div>
                            </li>
                        );
                    })}
            </ul>
        );
    };

    const searchBarInlineWidth = isSearchExpanded ? `${searchBarWidthPx + 15}px` : '0px';
    const isAdvancedPanelLayoutActive = isAdvancedPanelOpen || isAdvancedPanelExiting;

    return (
        <div
            ref={advanceSearchMountRef}
            className={`rs-asn-wrapper ${isAdvancedPanelOpen ? 'is-expanded-full' : ''} ${isAdvancedPanelLayoutActive ? 'is-advanced-panel-layout' : ''}`}
        >
            <div ref={searchTopRowRef} className={`rs-asn-top-row ${!isAdvancedPanelLayoutActive && !isSearchExpanded ? 'rs-asn-top-row--toolbar' : ''}`}>

                {/* Date picker / Dropdown */}
                <div ref={searchRightControlsRef} className={`SP-Menus rs-asn-right-controls ${!isAdvancedPanelLayoutActive ? '' : 'empty-width'}`}>
                    {dateRangeComponent}
                    {auxiliaryRightControls}
                </div>

                {/* Search full component expand */}
                <div ref={searchClusterRef} className={`SP-SearchFull rs-asn-search-cluster ${isSearchExpanded || isAdvancedPanelExiting ? 'is-expanded' : ''}`}>

                    {/* Expanding */}
                    <div
                        className="SP-Expanding rs-asn-search-bar-wrap"
                        style={{
                            flexGrow: 0,
                            flexShrink: 0,
                            flexBasis: searchBarInlineWidth,
                            width: searchBarInlineWidth,
                            maxWidth: searchBarInlineWidth,
                            opacity: isSearchExpanded ? 1 : 0,
                            pointerEvents: isSearchExpanded ? 'auto' : 'none',
                        }}
                    >
                        <div className="rs-asn-search-bar">

                            {/* Left area */}
                            <div className={`SP-LeftArea rs-asn-search-type-trigger ${(!isAdvancedPanelLayoutActive && !hasActiveFilterTags) ? '' : 'empty-width'}`}>
                                <RSBootstrapdown
                                    containerClass={isAdvancedPanelLayoutActive ? 'pe-none d-none' : ''}
                                    data={advanceSearchOptions}
                                    showUpdate={false}
                                    disbleItems={disabledAdvanceOptions}
                                    onSelect={handleSearchTypeSelect}
                                    defaultItem={
                                        <RSTooltip position="bottom" text={'More option'} className="lh0">
                                            <i
                                                className={`${advance_search_justify_dropdown_mini} icon-xs`}
                                            />
                                        </RSTooltip>
                                    }
                                    className="no_caret"
                                />
                            </div>

                            {/* Center area */}
                            <div className="SP-CenterArea rs-asn-scroll-area">
                                <div
                                    className="rs-asn-search-bar-main"
                                    ref={expandedScrollRef}
                                    onMouseDown={(e) => {
                                        if (disabled || lockMainBarText) return;
                                        const t = e.target;
                                        if (!(t instanceof HTMLElement)) return;
                                        if (t.closest('.rs-asn-chips-inline')) return;
                                        if (t.classList.contains('rs-asn-search-input')) return;
                                        requestAnimationFrame(() => {
                                            inputRef.current?.focus();
                                        });
                                    }}
                                >

                                    {/* Multi select list */}
                                    <div
                                        ref={expandedChipsMeasureRef}
                                        className={`rs-asn-chips-inline ${isAdvancedPanelLayoutActive ? 'pl10' : 'pl5'} ${hasActiveFilterTags ? '' : ''}`}
                                        aria-label="Active filters"
                                    >
                                        {renderActiveFilterChips()}
                                    </div>

                                    {/* Input text */}
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className={`rs-asn-search-input ${hasActiveFilterTags ? 'rs-asn-search-input--with-tags' : ''} ${lockMainBarText ? 'rs-asn-search-input--main-locked' : ''} ${hideMainBarInputWhenChipsPresent ? '' : ''}`}
                                        placeholder={
                                            hasActiveFilterTags
                                                ? ''
                                                : isAdvancedPanelLayoutActive
                                                    ? searchNameInputPlaceholderWhenAdvancedOpen
                                                    : 'By ' + (searchType || '').toLowerCase()
                                        }
                                        value={mainSearchBarDisplayValue}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        readOnly={lockMainBarText}
                                        tabIndex={disabled ? -1 : 0}
                                        onPointerDown={(e) => {
                                            if (disabled) return;
                                            if (e.pointerType === 'mouse' && e.button !== 0) return;
                                            const el = e.currentTarget;
                                            requestAnimationFrame(() => {
                                                el.focus({ preventScroll: true });
                                            });
                                        }}
                                        disabled={disabled}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            {/* Right area */}
                            <ul className={`SP-RightArea rs-asn-search-actions right-1 position-relative ${showMainBarSearchLoading ? 'pl0' : ''}`}>

                                {/* Slider arrow */}
                                <li className={`SP-Arrow position-relative rs-asn-action-divider ${showExpandedChipScrollNav ? '' : 'empty-width'}`}>
                                    <RSTooltip text="Scroll left" position="top" className="lh0" innerContent={false}>
                                        <i
                                            className={`${advance_search_arrow_left_mini} icon-xs color-primary-blue ${!canScrollExpandedLeft ? 'click-off' : ''}`}
                                            onClick={() => canScrollExpandedLeft && scrollHorizontal(expandedScrollRef, -1)}
                                        />
                                    </RSTooltip>
                                    <RSTooltip text="Scroll right" position="top" className="lh0" innerContent={false}>
                                        <i
                                            className={`${advance_search_arrow_right_mini} icon-xs color-primary-blue ${!canScrollExpandedRight ? 'click-off' : ''}`}
                                            onClick={() => canScrollExpandedRight && scrollHorizontal(expandedScrollRef, 1)}
                                        />
                                    </RSTooltip>
                                </li>

                                {/* Loader */}
                                <li className={`SP-Loader rs-asn-search-field-loader position-relative ${showMainBarSearchLoading ? '' : 'empty-width'}`} aria-hidden="true">
                                    <span className="segment_loader" />
                                </li>

                                {/* Remove icon */}
                                <li className={`SP-RemoveIcon position-relative rs-asn-action-divider ${showToolbarClear ? '' : 'empty-width'}`}>
                                    <RSTooltip
                                        text={toolbarClearTooltip}
                                        position="top"
                                        className="lh0 position-relative"
                                        innerContent={false}
                                    >
                                        <i
                                            className={`${clear_mini} icon-xs color-primary-red`}
                                            onClick={handleToolbarClear}
                                        />
                                    </RSTooltip>
                                </li>

                                {/* Dropdown Open / Close */}
                                <li className={`SP-DropdownOpen position-relative rs-asn-action-divider ${filterConfig.length > 0 ? '' : 'empty-width'}`}>
                                    <RSTooltip
                                        text={isAdvancedPanelOpen ? 'Collapse' : 'Expand'}
                                        position="top"
                                        className="lh0 position-relative"
                                        innerContent={false}
                                    >
                                        <i
                                            className={`${isAdvancedPanelOpen
                                                ? advance_search_arrow_double_up_mini
                                                : advance_search_arrow_double_down_mini
                                                } icon-xs color-primary-blue ${isAdvancedPanelOpen ? 'is-open' : ''}`}
                                            onClick={isAdvancedPanelOpen ? handleAdvancedCancel : toggleAdvancedPanel}
                                        />
                                    </RSTooltip>
                                </li>

                                {/* Close */}
                                <li className="SP-Close position-relative rs-asn-action-divider">
                                    <RSTooltip text="Close" position="top" className="lh0 position-relative" innerContent={false}>
                                        <i
                                            className={`${advance_search_close_mini} icon-xs color-primary-blue`}
                                            onClick={() => {
                                                if (disabled) return;
                                                handleSearchClose();
                                            }}
                                        />
                                    </RSTooltip>
                                </li>
                            </ul>

                        </div>

                        {/* Suggestion */}
                        {renderCommunicationNameSuggestionList()}
                        {showSelectedFilterSuggestionList && (
                            <ul
                                className="SP-Suggestion rs-asn-name-suggest-list test css-scrollbar"
                                role="listbox"
                                aria-label={`${searchType} suggestions`}
                            >
                                {selectedFilterSuggestionRows.length > 0 ? (
                                    selectedFilterSuggestionRows.map((row, idx) => {
                                        const label = normalizeChipLabel(
                                            selectedSearchFilter?.isObject
                                                ? _get(row, selectedSearchFilter?.fieldKey || 'name', '')
                                                : row,
                                        );
                                        if (!label) return null;
                                        const stableId =
                                            selectedSearchFilter?.isObject && selectedSearchFilter?.idKey
                                                ? _get(row, selectedSearchFilter.idKey)
                                                : null;
                                        const rowKey =
                                            stableId != null && stableId !== ''
                                                ? `filter-id-${String(stableId)}`
                                                : `filter-${idx}-${label.slice(0, 64)}`;
                                        return (
                                            <li key={rowKey} className="rs-asn-name-suggest-item">
                                                <div
                                                    className="rs-asn-name-suggest-btn"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleSelectedFilterSuggestionPick(row);
                                                        handleSearchCollapse();
                                                    }}
                                                >
                                                    {label}
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="rs-asn-name-suggest-item rs-asn-name-suggest-item--empty" role="status">
                                        {SUGGESTION_LIST_EMPTY_LABEL}
                                    </li>
                                )}
                            </ul>
                        )}

                        {/* Open advanced search panel */}
                        <AnimatePresence
                            initial={false}
                            onExitComplete={() => setIsAdvancedPanelExiting(false)}
                        >
                            {filterConfig.length > 0 && isAdvancedPanelOpen && (
                                <motion.div
                                    key="rs-asn-advanced-panel"
                                    className="SP-OpenAdvanced rs-asn-advanced-panel"
                                    initial={ADVANCE_PANEL_MOTION.initial}
                                    animate={ADVANCE_PANEL_MOTION.animate}
                                    exit={ADVANCE_PANEL_MOTION.exit}
                                >
                                    <div className="rs-asn-advanced-grid mt-15">
                                        {sortedAdvanceFilterConfig.map((filter) => {
                                            const inputText = String(activeFilters[filter.key]?.rawValue ?? '').trim();
                                            const hasValue =
                                                filter.type === 'input'
                                                    ? Boolean(inputText)
                                                    : Boolean(activeFilters[filter.key]?.displayValue);

                                            const showInputLabelRow =
                                                filter.type === 'input' || hasValue || Boolean(filter.isMulti);
                                            return (
                                                <div
                                                    key={filter.key}
                                                    className={`rs-asn-filter-field ${showInputLabelRow ? 'has-value' : 'is-placeholder'} ${filter.type === 'input' ? 'rs-asn-filter-field--input' : ''}`}
                                                >
                                                    <div className="rs-asn-filter-field-control">
                                                        {filter.type === 'input' ? (
                                                            <div className="rs-asn-advanced-input-wrap position-relative">
                                                                <RSInput
                                                                    type="text"
                                                                    name={filter.key}
                                                                    control={advanceTextControl}
                                                                    label={filter.label || ''}
                                                                    disabled={disabled}
                                                                    isKeyDownUpPrevent={false}
                                                                    className="rs-asn-advanced-text-input"
                                                                    classWrapper="rs-asn-adv-input-field"
                                                                    handleOnchange={(e) =>
                                                                        handleFilterTextChange(filter.key, e.target.value)
                                                                    }
                                                                    autoComplete="off"
                                                                    autoCorrect="off"
                                                                    autoCapitalize="off"
                                                                    spellCheck={false}
                                                                />
                                                                {showAdvanceInputLoading && filter.key === 'communication_name' && (
                                                                    <div
                                                                        className="rs-inputIcon-wrapper rs-asn-advanced-input-loader"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <span className="segment_loader" />
                                                                    </div>
                                                                )}
                                                                {filter.key === 'communication_name' &&
                                                                    showAdvanceCommNameSuggestList && (
                                                                        <ul
                                                                            className="rs-asn-name-suggest-list css-scrollbar"
                                                                            role="listbox"
                                                                            aria-label={`${nameInputFilterLabel} suggestions`}
                                                                        >
                                                                            {showAdvanceSuggestionsNoResults && (
                                                                                <li
                                                                                    className="rs-asn-name-suggest-item rs-asn-name-suggest-item--empty"
                                                                                    role="status"
                                                                                >
                                                                                    {SUGGESTION_LIST_EMPTY_LABEL}
                                                                                </li>
                                                                            )}
                                                                            {!resolvedSuggestionsLoading &&
                                                                                resolvedSuggestions.map((row, idx) => {
                                                                                    const label = resolveAutoSuggestLabel(
                                                                                        row,
                                                                                        suggestionLabelOptions,
                                                                                    );
                                                                                    if (!label) return null;
                                                                                    const stableId = STABLE_ROW_ID_KEYS.map(
                                                                                        (k) => row?.[k],
                                                                                    ).find((v) => v != null && v !== '');
                                                                                    const rowKey =
                                                                                        stableId != null
                                                                                            ? `adv-id-${String(stableId)}`
                                                                                            : `adv-${idx}-${label.slice(0, 64)}`;
                                                                                    return (
                                                                                        <li
                                                                                            key={rowKey}
                                                                                            className="rs-asn-name-suggest-item"
                                                                                        >
                                                                                            <div
                                                                                                className="rs-asn-name-suggest-btn"
                                                                                                onMouseDown={(e) => {
                                                                                                    e.preventDefault();
                                                                                                    handleAdvanceCommunicationNameSuggestPick(
                                                                                                        label,
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                {label}
                                                                                            </div>
                                                                                        </li>
                                                                                    );
                                                                                })}
                                                                        </ul>
                                                                    )}
                                                            </div>
                                                        ) : filter.isMulti ? (
                                                            <RSMultiSelectNew
                                                                data={filter.data}
                                                                isObject={filter.isObject}
                                                                fieldKey={filter.fieldKey}
                                                                itemKey={filter.itemKey}
                                                                label={filter.label}
                                                                value={activeFilters[filter.key]?.rawValue || []}
                                                                onSelect={(items) => handleMultiFilterSelect(filter.key, items)}
                                                                alignRight
                                                                disabled={disabled}
                                                                insertAfterSelectAll={filter.insertAfterSelectAll}
                                                                selectAllLabel={filter.selectAllTagLabel ?? DEFAULT_SELECT_ALL_TAG_LABEL}
                                                                hideSelectAllRow={Boolean(filter.hideSelectAllRow)}
                                                                omitStaticLabelInToggle
                                                            />
                                                        ) : (
                                                            <RSBootstrapdown
                                                                data={filter.data}
                                                                isObject={filter.isObject}
                                                                fieldKey={filter.fieldKey}
                                                                idKey={filter.idKey}
                                                                defaultItem={getDropdownDefaultItem(filter, activeFilters)}
                                                                showUpdate={false}
                                                                toggleLabel={filter.label}
                                                                alignRight
                                                                className="rs-asn-filter-dropdown"
                                                                popperConfig={RS_ADVANCE_SEARCH_DROPDOWN_POPPER_CONFIG}
                                                                onSelect={(value) => handleFilterSelect(filter.key, value)}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="rs-asn-advanced-footer">
                                        <RSSecondaryButton type="button" onClick={handleAdvancedCancel}>
                                            Cancel
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            type="button"
                                            onClick={handleSearchSubmit}
                                            disabled={disabled || !canSubmitAdvancedFooterSearch}
                                            disabledClass={disabled || !canSubmitAdvancedFooterSearch ? 'click-off' : ''}
                                        >
                                            Search
                                        </RSPrimaryButton>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Main search icon */}
                    <div ref={searchIconBoxRef} className="SP-MainSearch position-relative search-icon-box">
                        <RSTooltip
                            text={'Search'
                            }
                            position="top"
                            className="lh0 position-relative"
                            innerContent={false}
                        >
                            <div className={`${disabled || (isSearchExpanded && !canClickToolbarZoomSearch) ? 'pe-none click-off' : ''}`}>
                                <i
                                    id="rs_RSAdvanceSearch_zoom"
                                    className={`${circle_zoom_fill_edge_large} icon-lg color-primary-blue`}
                                    onClick={() => {
                                        if (disabled) return;
                                        if (!isSearchExpanded) {
                                            handleSearchExpand();
                                            return;
                                        }
                                        if (canClickToolbarZoomSearch) {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    aria-disabled={isSearchExpanded && !canClickToolbarZoomSearch}
                                />
                            </div>
                        </RSTooltip>
                    </div>

                </div>
                {createButtonComponent ? (
                    <div ref={searchCreateButtonRef} className="d-flex align-items-center">{createButtonComponent}</div>
                ) : null}
            </div>
        </div >
    );
};

RSAdvanceSearchNew.propTypes = {
    activeFilters: PropTypes.object,
    searchPlaceholder: PropTypes.string,
    onSearch: PropTypes.func,
    onSearchChange: PropTypes.func,
    onRefresh: PropTypes.func,
    onClear: PropTypes.func,
    filterConfig: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,

            type: PropTypes.string,
            data: PropTypes.array,
            isObject: PropTypes.bool,
            fieldKey: PropTypes.string,
            itemKey: PropTypes.string,
            idKey: PropTypes.string,
            defaultItem: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
            isMulti: PropTypes.bool,
            showUpdate: PropTypes.bool,
            insertAfterSelectAll: PropTypes.node,

            selectAllTagLabel: PropTypes.string,

            hideSelectAllRow: PropTypes.bool,
        }),
    ),
    onFiltersChange: PropTypes.func,
    dateRangeComponent: PropTypes.node,
    auxiliaryRightControls: PropTypes.node,
    createButtonComponent: PropTypes.node,
    disabled: PropTypes.bool,
    initialActiveFilters: PropTypes.object,
    initialActiveFiltersSeedKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    clearActiveFiltersOnSearchClose: PropTypes.bool,
    activeFiltersRestoreOnSearchClose: PropTypes.object,
    onSearchExpandedChange: PropTypes.func,
    supplementalFilterTags: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            displayValue: PropTypes.string.isRequired,
            onRemove: PropTypes.func,
        }),
    ),
    excludeActiveFilterTagKeys: PropTypes.arrayOf(PropTypes.string),
    includeExcludedTagsWhenAdvancedOpen: PropTypes.bool,
    onAdvancePanelChannelTypeRowSync: PropTypes.func,
    searchSuggestions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
    searchSuggestionsLoading: PropTypes.bool,
    onSearchSuggestionPick: PropTypes.func,
    communicationNameSuggestions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
    communicationNameSuggestionsLoading: PropTypes.bool,
    onCommunicationNameSuggestionPick: PropTypes.func,
    searchValueSync: PropTypes.shape({
        rev: PropTypes.number,
        value: PropTypes.string,
    }),
    getSuggestionLabel: PropTypes.func,
    suggestionLabelKeys: PropTypes.arrayOf(PropTypes.string),
    minCharsForSearchSubmit: PropTypes.number,
    persistActiveFilters: PropTypes.bool,
    persistActiveFiltersStorageKey: PropTypes.string,
    persistMergeOmitKeys: PropTypes.arrayOf(PropTypes.string),
    getTagDisplayOverride: PropTypes.func,
    showActiveFilterTagsWhenCollapsed: PropTypes.bool,
    hideCollapsedSearchQuerySummary: PropTypes.bool,
    lockMainBarWhenFilterChipsPresent: PropTypes.bool,
    onAdvanceCommunicationNameSearchChange: PropTypes.func,
    onAdvanceCommunicationNameSuggestDismiss: PropTypes.func,
    onSearchTypeChange: PropTypes.func,
    disabledAdvanceOptions: PropTypes.array,
};

export default memo(RSAdvanceSearchNew);
