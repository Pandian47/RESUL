import _get from 'lodash/get';

/** Mirrors Constants/AdvanceSearch — inlined to avoid prod bundle TDZ. */
const DEFAULT_ADVANCE_SEARCH_SORT_BY_ID = 1;

/** Collapses odd whitespace in chip labels (API / object names). */
const normalizeChipLabel = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

/**
 * Same chip rows as `RSAdvanceSearchNew` `multiFilterChipTags` — used to align main-bar autosuggest suppression
 * with visible chips (default `sort_type` is omitted so it does not block name suggest).
 */
export function buildAdvanceFilterChipTagsList({
    activeFilters = {},
    filterConfig = [],
    excludeActiveFilterTagKeys = [],
    getTagDisplayOverride,
}) {
    const overrideFn = typeof getTagDisplayOverride === 'function' ? getTagDisplayOverride : null;
    const tags = [];
    Object.entries(activeFilters).forEach(([filterKey, filter]) => {
        if (!filter || !filter.displayValue) return;
        if (excludeActiveFilterTagKeys.includes(filterKey)) return;

        if (filterKey === 'sort_type') {
            const raw = filter.rawValue;
            const id =
                raw != null && typeof raw === 'object' && !Array.isArray(raw)
                    ? Number(raw.id)
                    : Number(raw);
            if (Number.isFinite(id) && id === DEFAULT_ADVANCE_SEARCH_SORT_BY_ID) {
                return;
            }
        }

        const cfg = filterConfig.find((f) => f.key === filterKey);
        const label = cfg?.label || filterKey;
        const raw = filter.rawValue;
        const chipRemovable = cfg?.isMandatory !== true;

        const overridden = overrideFn?.({ key: filterKey, filter, activeFilters });
        const hasOverride = overridden != null && String(overridden).trim() !== '';
        if (hasOverride) {
            tags.push({
                key: filterKey,
                filterKey,
                label,
                displayValue: String(overridden).trim(),
                removable: chipRemovable,
            });
            return;
        }

        if (cfg?.isMulti && Array.isArray(raw)) {
            if (isEntireMultiSelectChosen(cfg, raw)) {
                tags.push({
                    key: filterKey,
                    filterKey,
                    label,
                    displayValue: filter.displayValue,
                    removable: chipRemovable,
                });
                return;
            }
            raw.forEach((item, idx) => {
                const v = cfg?.isObject
                    ? _get(item, cfg?.fieldKey || 'name', '')
                    : String(item ?? '');
                const displayValue = normalizeChipLabel(v);
                if (!displayValue) return;
                tags.push({
                    key: `${filterKey}-${idx}-${displayValue}`,
                    filterKey,
                    label,
                    displayValue,
                    itemIndexToRemove: idx,
                    removable: chipRemovable,
                });
            });
            return;
        }

        tags.push({
            key: filterKey,
            filterKey,
            label,
            displayValue: filter.displayValue,
            removable: chipRemovable,
        });
    });
    return tags;
}

export const MAIN_BAR_NON_BLOCKING_FILTER_KEYS = new Set(['communication_name', 'sort_type']);

export function hasBlockingAdvanceFilterChips(multiFilterChipTags = []) {
    if (!Array.isArray(multiFilterChipTags) || multiFilterChipTags.length === 0) return false;
    return !multiFilterChipTags.every(
        (t) => !t.filterKey || MAIN_BAR_NON_BLOCKING_FILTER_KEYS.has(t.filterKey),
    );
}

/** Optional extra keys to hide from the chip row (per screen). Sort chips use `sort_type` default-id logic above. */
export const DEFAULT_EXCLUDE_ACTIVE_FILTER_TAG_KEYS = [];

export const DEFAULT_SEARCH_PLACEHOLDER = 'Search...';

export const DEFAULT_SELECT_ALL_TAG_LABEL = 'All';

export const SUGGESTION_LIST_LOADING_LABEL = 'Loading…';

export const SUGGESTION_LIST_EMPTY_LABEL = 'No results found';

/** Sort dropdown must use selected `rawValue` as defaultItem; remounting via `key` reset the label and looked like a no-op. */
export function getDefaultItemForDropdown(filter) {
    if (filter.defaultItem !== undefined) return filter.defaultItem;
    if (filter.isObject) {
        return { [filter.fieldKey || 'name']: filter.label };
    }
    return filter.label;
}

export function getDropdownDefaultItem(filter, activeFilters = {}) {
    const fromActive = activeFilters[filter.key]?.rawValue;

    if (filter.key === 'sort_type') {
        if (fromActive && typeof fromActive === 'object' && Number(fromActive.id) > 0) {
            return fromActive;
        }
        return getDefaultItemForDropdown(filter);
    }

    /** Single-select object rows (e.g. Gallery channel): must pass real `rawValue` so menu `active` matches via `idKey`. */
    if (!filter.isMulti && filter.isObject && fromActive && typeof fromActive === 'object' && !Array.isArray(fromActive)) {
        const idKey = filter.idKey;
        if (idKey) {
            const idVal = _get(fromActive, idKey);
            if (idVal !== undefined && idVal !== null && idVal !== '') {
                return fromActive;
            }
        }
        const fk = filter.fieldKey || 'name';
        if (_get(fromActive, fk)) {
            return fromActive;
        }
    }

    return getDefaultItemForDropdown(filter);
}

/** @returns {number|null} — null means no minimum length gate. */
export function parseMinCharsForSearchSubmit(minCharsForSearchSubmit) {
    if (minCharsForSearchSubmit == null || Number(minCharsForSearchSubmit) <= 0) {
        return null;
    }
    return Number(minCharsForSearchSubmit);
}

export function meetsSuggestionCharsThreshold(trimmedSearchValue, suggestionMinChars) {
    if (suggestionMinChars != null) {
        return trimmedSearchValue.length >= suggestionMinChars;
    }
    return trimmedSearchValue.length > 0;
}

/** Enter / search button: allow submit when empty min or trimmed length meets threshold. */
export function shouldAllowSearchSubmit(raw, minCharsForSearchSubmit) {
    const trimmed = String(raw ?? '').trim();
    if (minCharsForSearchSubmit == null || Number(minCharsForSearchSubmit) <= 0) {
        return true;
    }
    return trimmed.length >= Number(minCharsForSearchSubmit);
}

/**
 * @param {boolean} sawSuggestionsLoadingForQuery — ref-backed: loading ran for current trimmed query.
 */
export function getSuggestionPanelVisibility({
    resolvedSuggestionsLoading,
    suggestionCount,
    meetsSuggestionThreshold,
    sawSuggestionsLoadingForQuery,
}) {
    const showSuggestionsNoResults =
        meetsSuggestionThreshold &&
        !resolvedSuggestionsLoading &&
        suggestionCount === 0 &&
        sawSuggestionsLoadingForQuery;
    const showSuggestionPanel = suggestionCount > 0 || showSuggestionsNoResults;
    return { showSuggestionsNoResults, showSuggestionPanel };
}

/**
 * True when the multiselect selection is exactly every selectable row in filter.data
 * (excludes rows whose display label is "all", case-insensitive).
 * For `created_by`, compares stable `userId` values so duplicate display names (e.g. two "Approver")
 * do not break equality; other filters still use fieldKey.
 */
export function isEntireMultiSelectChosen(filter, items) {
    const data = filter?.data || [];
    if (!items?.length || !data.length) return false;
    const fieldKey = filter?.fieldKey || 'name';
    const isObject = filter?.isObject;

    const displayKeyOf = (row) =>
        String(isObject ? _get(row, fieldKey, '') : (row ?? ''))
            .trim()
            .toLowerCase();

    const selectableRows = data.filter((row) => {
        const k = displayKeyOf(row);
        return k !== 'all' && k !== 'all list';
    });
    if (!selectableRows.length) return false;

    /**
     * Any multiselect: if the catalog has only one real option, choosing it matches “length === entire list”
     * by accident — chips must show that value, not the synthetic “All” / select-all label. Applies to
     * `created_by`, `list_type`, `tags`, `delivery_type`, etc.
     */
    if (selectableRows.length <= 1) {
        return false;
    }

    const sortIdStrings = (ids) =>
        [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join('\u0001');

    if (filter?.key === 'created_by' && isObject) {
        const rowsWithUserId = selectableRows.filter((row) => {
            const id = _get(row, 'userId', '');
            return id !== '' && id !== null && id !== undefined;
        });
        if (!rowsWithUserId.length) return false;
        const idOf = (row) => String(_get(row, 'userId', ''));
        const selectableIds = rowsWithUserId.map(idOf);
        const itemsWithUserId = items.filter((item) => {
            const id = _get(item, 'userId', '');
            return id !== '' && id !== null && id !== undefined;
        });
        const itemIds = itemsWithUserId.map(idOf);
        if (selectableIds.length !== itemIds.length) return false;
        return sortIdStrings(selectableIds) === sortIdStrings(itemIds);
    }

    const useCampaignAttributeIds =
        filter?.key === 'communication_type' &&
        isObject &&
        selectableRows.every((row) => {
            const id = _get(row, 'campaignAttributeId', '');
            return id !== '' && id !== null && id !== undefined;
        });

    if (useCampaignAttributeIds) {
        const idOf = (row) => String(_get(row, 'campaignAttributeId', ''));
        const selectableIds = selectableRows.map(idOf);
        const itemIds = items.map(idOf);
        if (selectableIds.length !== itemIds.length) return false;
        return sortIdStrings(selectableIds) === sortIdStrings(itemIds);
    }

    const useChannelIds =
        filter?.key === 'channel_type' &&
        isObject &&
        selectableRows.every((row) => {
            const id = _get(row, 'id', '');
            return id !== '' && id !== null && id !== undefined;
        });

    if (useChannelIds) {
        const idOf = (row) => String(_get(row, 'id', ''));
        const selectableIds = selectableRows.map(idOf);
        const itemIds = items.map(idOf);
        if (selectableIds.length !== itemIds.length) return false;
        return sortIdStrings(selectableIds) === sortIdStrings(itemIds);
    }

    const useDeliveryTypeIds =
        filter?.key === 'delivery_type' &&
        isObject &&
        selectableRows.every((row) => {
            const id = _get(row, 'id', '');
            return id !== '' && id !== null && id !== undefined;
        });

    if (useDeliveryTypeIds) {
        const idOf = (row) => String(_get(row, 'id', ''));
        const selectableIds = selectableRows.map(idOf);
        const itemIds = items.map(idOf);
        if (selectableIds.length !== itemIds.length) return false;
        return sortIdStrings(selectableIds) === sortIdStrings(itemIds);
    }

    const useProductCategoryIds =
        filter?.key === 'product_type' &&
        isObject &&
        selectableRows.every((row) => {
            const id = _get(row, 'categoryId', '');
            return id !== '' && id !== null && id !== undefined;
        });

    if (useProductCategoryIds) {
        const idOf = (row) => String(_get(row, 'categoryId', ''));
        const selectableIds = selectableRows.map(idOf);
        const itemIds = items.map(idOf);
        if (selectableIds.length !== itemIds.length) return false;
        return sortIdStrings(selectableIds) === sortIdStrings(itemIds);
    }

    const useTagKeys =
        filter?.key === 'tags' &&
        isObject &&
        selectableRows.every((row) => {
            const t = _get(row, 'tags', '');
            return t !== '' && t !== null && t !== undefined;
        });

    if (useTagKeys) {
        const idOf = (row) => String(_get(row, 'tags', '')).trim().toLowerCase();
        const selectableIds = selectableRows.map(idOf);
        const itemIds = items.map(idOf);
        if (selectableIds.length !== itemIds.length) return false;
        return sortIdStrings(selectableIds) === sortIdStrings(itemIds);
    }

    if (items.length !== selectableRows.length) return false;
    const keyOf = (item) => (isObject ? _get(item, fieldKey, '') : String(item ?? ''));
    const sortKeys = (arr) =>
        [...arr].map(keyOf).map(String).sort((a, b) => a.localeCompare(b)).join('\u0001');
    return sortKeys(selectableRows) === sortKeys(items);
}

/** Shallow keys tried for API rows (communication list, audience list name search, etc.). */
const DEFAULT_SUGGESTION_LABEL_KEYS = [
    'communicationName',
    'communication_name',
    'listName',
    'list_name',
    'campaignName',
    'segmentationListName',
    'name',
    'label',
    'text',
    'title',
];

export const STABLE_ROW_ID_KEYS = ['listId', 'id', 'campaignID', 'campaignId', 'campaignGUID'];

/**
 * Resolves a display string for auto-suggest rows: primitives, common name keys, or optional custom getter.
 * Avoids `[object Object]` when the API returns objects like `{ listId, listName }`.
 */
export function resolveAutoSuggestLabel(row, options = {}) {
    const { getLabel, extraKeys = [] } = options;
    if (getLabel && typeof getLabel === 'function') {
        try {
            const v = getLabel(row);
            if (v != null && String(v).trim() !== '') return String(v).trim();
        } catch {
            return '';
        }
    }
    if (row == null) return '';
    const t = typeof row;
    if (t === 'string' || t === 'number' || t === 'boolean') return String(row).trim();
    if (t !== 'object') return String(row).trim();

    const keys = [...(Array.isArray(extraKeys) ? extraKeys : []), ...DEFAULT_SUGGESTION_LABEL_KEYS];
    for (const key of keys) {
        if (key == null || !Object.prototype.hasOwnProperty.call(row, key)) continue;
        const v = row[key];
        if (v == null) continue;
        if (typeof v === 'object') continue;
        const s = String(v).trim();
        if (s !== '') return s;
    }
    return '';
}

export const ADVANCE_SEARCH_ACTIVE_FILTERS_STORAGE_PREFIX = 'resul-asn-active-filters';

export function buildAdvanceSearchPersistStorageKey(screenId, ...parts) {
    const safe = parts.map((p) => (p == null ? '' : String(p))).join(':');
    return `${ADVANCE_SEARCH_ACTIVE_FILTERS_STORAGE_PREFIX}:${screenId}:${safe}`;
}

/** True when `localStorage` has non-empty persisted advance-filter JSON for this key. */
export function hasPersistedAdvanceFilters(persistActiveFiltersStorageKey) {
    if (!persistActiveFiltersStorageKey || typeof persistActiveFiltersStorageKey !== 'string') return false;
    try {
        const raw = localStorage.getItem(persistActiveFiltersStorageKey);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return false;
        if (parsed.v === 1 && parsed.filters && typeof parsed.filters === 'object') {
            return Object.keys(parsed.filters).length > 0;
        }
        return Object.keys(parsed).length > 0;
    } catch {
        return false;
    }
}

/**
 * Resolves “My communications” scope immediately from `localStorage` before building list payloads.
 * `RSAdvanceSearchNew` child layout can run before parent layout; without this, the first
 * `onFiltersChange` may still see the default ref (`true`) and send `createdBy: currentUserId`
 * while no “My communications” chip is shown.
 */
export function resolveMyCommunicationsScopeFromStorage({
    persistFiltersStorageKey,
    persistMyCommScopeKey,
    fallbackFromRef,
}) {
    try {
        if (persistMyCommScopeKey) {
            const raw = localStorage.getItem(persistMyCommScopeKey);
            if (raw === 'true' || raw === 'false') {
                return raw === 'true';
            }
        }
        if (hasPersistedAdvanceFilters(persistFiltersStorageKey)) {
            return false;
        }
    } catch {
        /* ignore */
    }
    return Boolean(fallbackFromRef);
}
