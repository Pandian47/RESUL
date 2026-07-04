/**
 * ResKendoGrid - Utility Functions
 *
 * Consolidated from RSKendoGrid, RSCustomKendoGrid, and RSKendoGridNew.
 */
import {
    DEFAULT_PENDING_COLUMN_WIDTH,
    DEFAULT_SKELETON_COLUMN_COUNT,
    VARIANT_PRESETS,
    VALUE_INDEPENDENT_OPERATORS,
} from './config';

// ---------------------------------------------------------------------------
// Feature flag resolution
// ---------------------------------------------------------------------------

/**
 * Resolve final feature flags by merging:
 *   variant preset -> features object -> individual boolean props
 *
 * Individual boolean props (pageable, sortable, etc.) take highest priority.
 * `undefined` values are skipped so they don't override lower-priority sources.
 */
export const resolveFeatureFlags = (variant, features, propOverrides) => {
    const preset = VARIANT_PRESETS[variant] || VARIANT_PRESETS.default;

    // Remove undefined keys from propOverrides so they don't clobber preset/features
    const cleanOverrides = {};
    if (propOverrides) {
        Object.entries(propOverrides).forEach(([key, value]) => {
            if (value !== undefined) {
                cleanOverrides[key] = value;
            }
        });
    }

    return { ...preset, ...(features || {}), ...cleanOverrides };
};

// ---------------------------------------------------------------------------
// Data state change detection
// ---------------------------------------------------------------------------

/**
 * Detect which aspects of the data state changed between two states.
 * Used to determine whether to fetch server data or process client-side.
 */
export const detectChangeType = (prev, next) => {
    const pagingChanged = prev.skip !== next.skip || prev.take !== next.take;
    const sortingChanged = JSON.stringify(prev.sort) !== JSON.stringify(next.sort);
    const filteringChanged = JSON.stringify(prev.filter) !== JSON.stringify(next.filter);
    return {
        pagingChanged,
        sortingChanged,
        filteringChanged,
    };
};

// ---------------------------------------------------------------------------
// Active filter evaluation
// ---------------------------------------------------------------------------

/**
 * Determine if the grid currently has meaningful active filters.
 * Handles value-independent operators (isnull, isnotnull, etc.).
 */
export const hasActiveFilters = (filter) => {
    const hasMeaningfulValue = (value) => {
        if (value === null || value === undefined) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        if (value instanceof Date) return !Number.isNaN(value.getTime());
        if (typeof value === 'object') {
            return Object.values(value).some((innerValue) => hasMeaningfulValue(innerValue));
        }
        return true;
    };

    const evaluateFilters = (f) => {
        if (!f) return false;
        const filtersArray = Array.isArray(f.filters) ? f.filters : [];
        if (!filtersArray.length) return false;
        return filtersArray.some((item) => {
            if (item?.filters) {
                return evaluateFilters(item);
            }
            const operator = item?.operator;
            if (VALUE_INDEPENDENT_OPERATORS.has(operator)) {
                return Boolean(item?.field);
            }
            if ('value' in item) {
                return hasMeaningfulValue(item.value);
            }
            return false;
        });
    };

    return evaluateFilters(filter);
};

// ---------------------------------------------------------------------------
// Data flattening (from RSKendoGridNew)
// ---------------------------------------------------------------------------

/**
 * Flatten nested data structure for grouped grid display.
 * Handles both old format (dateCategory/date_Category) and new format (sms/email/whatsApp arrays).
 *
 * @param {Array} rawData - Raw data from API
 * @param {Object} options
 * @param {boolean} options.groupable - Whether grouping is enabled
 * @param {string} options.selectedChannel - Channel filter ('All channels' or specific channel)
 * @returns {Array} Flattened data array
 */
export const flattenData = (rawData, options = {}) => {
    const { groupable = true, selectedChannel = 'All channels' } = options;

    if (!rawData || rawData.length === 0) return [];

    return rawData.map((item) => {
        const flattened = { ...item };

        // Check for old structure (dateCategory or date_Category)
        const dateArray = item.dateCategory || item.date_Category;

        if (dateArray && Array.isArray(dateArray)) {
            dateArray.forEach((entry) => {
                Object.keys(entry).forEach((key) => {
                    if (key !== 'date') {
                        const value = entry[key];
                        const fieldName = `${entry.date}_${key}`;
                        if (
                            value !== null &&
                            value !== undefined &&
                            value !== '' &&
                            value !== 'NA'
                        ) {
                            const numValue = Number(value);
                            flattened[fieldName] =
                                !isNaN(numValue) && typeof value !== 'boolean' ? numValue : value;
                        } else {
                            flattened[fieldName] = value;
                        }
                    }
                });
            });
        } else {
            // New structure with separate channel arrays
            const allChannelArrays = ['sms', 'email', 'whatsApp'];
            const channelArrays =
                selectedChannel === 'All channels'
                    ? allChannelArrays
                    : allChannelArrays.filter(
                          (c) => c.toLowerCase() === selectedChannel.toLowerCase(),
                      );

            const dateMap = new Map();
            const channelsWithData = [];

            channelArrays.forEach((channel) => {
                const channelData = item[channel];
                if (Array.isArray(channelData) && channelData.length > 0) {
                    channelsWithData.push(channel);
                    channelData.forEach((entry) => {
                        if (entry && entry.date) {
                            if (!dateMap.has(entry.date)) {
                                dateMap.set(entry.date, {});
                            }
                            dateMap.get(entry.date)[channel] = entry.count;
                        }
                    });
                }
            });

            // Single channel without grouping → simple date_count format
            if (channelsWithData.length === 1 && !groupable) {
                const activeChannel = channelsWithData[0];
                dateMap.forEach((channels, date) => {
                    const value = channels[activeChannel];
                    const fieldName = `${date}_count`;
                    if (
                        value !== null &&
                        value !== undefined &&
                        value !== '' &&
                        value !== 'NA'
                    ) {
                        const numValue = Number(value);
                        flattened[fieldName] =
                            !isNaN(numValue) && typeof value !== 'boolean' ? numValue : value;
                    } else {
                        flattened[fieldName] = value;
                    }
                });
            } else {
                // Multiple channels or groupable → grouped format
                dateMap.forEach((channels, date) => {
                    Object.keys(channels).forEach((channel) => {
                        const value = channels[channel];
                        const fieldName = `${date}_${channel}`;
                        if (
                            value !== null &&
                            value !== undefined &&
                            value !== '' &&
                            value !== 'NA'
                        ) {
                            const numValue = Number(value);
                            flattened[fieldName] =
                                !isNaN(numValue) && typeof value !== 'boolean' ? numValue : value;
                        } else {
                            flattened[fieldName] = value;
                        }
                    });
                });
            }

            // Clean up original channel arrays
            channelArrays.forEach((channel) => {
                delete flattened[channel];
            });
        }

        // Remove old structure fields
        delete flattened.dateCategory;
        delete flattened.date_Category;

        return flattened;
    });
};

// ---------------------------------------------------------------------------
// Cell display formatting (default TruncatedCell renderer)
// ---------------------------------------------------------------------------

const GRID_CELL_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Short display string for grid cells; avoids Date.prototype.toString() overflow. */
export const formatGridCellDisplayValue = (value) => {
    if (value == null) return '';
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return '';
        const day = String(value.getDate()).padStart(2, '0');
        return `${day} ${GRID_CELL_MONTHS[value.getMonth()]},${value.getFullYear()}`;
    }
    return String(value);
};

/** Full value for tooltip when the displayed cell text is shortened. */
export const getGridCellTooltipText = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toLocaleString();
    }
    return undefined;
};

/** Kendo v15 detail rows use detailExpand keyed by dataItemKey. */
export const buildDetailExpandFromData = (rows, dataItemKey, expandField) => {
    if (!rows?.length || !dataItemKey || !expandField) return undefined;

    return rows.reduce((acc, item) => {
        const key = item?.[dataItemKey];
        if (key !== undefined && key !== null) {
            acc[String(key)] = Boolean(item[expandField]);
        }
        return acc;
    }, {});
};

const DATA_ITEM_KEY_CANDIDATES = ['id', 'campaignID', 'campaignGUID', 'campaignId'];

/** Resolve row key for hierarchy/detail expand (settings.dataItemKey or first match on row). */
export const resolveDataItemKey = (settings, rows) => {
    if (settings?.dataItemKey) return settings.dataItemKey;
    if (!settings?.detail || !settings?.expandField) return undefined;

    const sample = rows?.[0];
    if (!sample) return 'id';

    return DATA_ITEM_KEY_CANDIDATES.find((key) => key in sample) ?? 'id';
};

const DEFAULT_SKELETON_COLUMN_WIDTH = 140;

export const parseSkeletonWidth = (width) => {
    if (width == null || width === '' || width === 0 || width === '0' || width === '0px') {
        return null;
    }
    if (typeof width === 'number' && !Number.isNaN(width) && width > 0) {
        return `${width}px`;
    }
    if (typeof width === 'string') {
        const trimmed = width.trim();
        if (!trimmed || trimmed === '0' || trimmed === '0px') return null;
        if (/[a-z%]+$/i.test(trimmed)) return trimmed;
        const numeric = parseFloat(trimmed);
        if (!Number.isNaN(numeric) && numeric > 0) return `${numeric}px`;
    }
    return null;
};

/** Column count for loading skeleton: explicit prop > default while pending > configured columns > default. */
export const resolveEffectiveSkeletonColumnCount = (
    skeletonColumns,
    columns = [],
    { isGridPending = false } = {},
) => {
    if (Number(skeletonColumns) > 0) return skeletonColumns;
    if (isGridPending) return DEFAULT_SKELETON_COLUMN_COUNT;
    if (Array.isArray(columns) && columns.length > 0) return columns.length;
    return DEFAULT_SKELETON_COLUMN_COUNT;
};

/** Placeholder columns injected while the grid is pending to prevent single-column layout jerk. */
export const buildPendingGridColumns = (count, width = DEFAULT_PENDING_COLUMN_WIDTH) =>
    Array.from({ length: count }, (_, index) => ({
        field: `__rs_grid_pending_${index}`,
        title: '\u00A0',
        width,
    }));

/** Stable column widths for loading / empty skeletons (avoids width: 0 when data is empty). */
export const resolveSkeletonColumnConfigs = (columns = [], options = {}) => {
    const { hierarchyWidth = null, defaultWidth = DEFAULT_SKELETON_COLUMN_WIDTH } = options;
    const resolved = (columns ?? []).map((col) => ({
        ...col,
        width: parseSkeletonWidth(col?.width) ?? defaultWidth,
    }));

    if (hierarchyWidth) {
        return [{ width: parseSkeletonWidth(hierarchyWidth) ?? hierarchyWidth }, ...resolved];
    }

    return resolved;
};

export const sumMeasuredPixelWidths = (widths = []) =>
    widths.reduce((sum, width) => {
        const numeric = parseFloat(width);
        return Number.isNaN(numeric) ? sum : sum + numeric;
    }, 0);

export const toPercentageColumnWidth = (width, total) => {
    const numeric = parseFloat(width);
    if (!total || Number.isNaN(numeric) || numeric <= 0) return null;
    return `${((numeric / total) * 100).toFixed(6)}%`;
};

/** Full scrollable header table width (not just the visible viewport slice). */
export const resolveHeaderSyncedTableWidth = (headerWidths = [], headerTableWidth = 0) => {
    const measuredTotal = sumMeasuredPixelWidths(headerWidths);
    if (measuredTotal > 0) {
        return Math.max(measuredTotal, headerTableWidth || 0);
    }
    return headerTableWidth || 0;
};

/** Scale measured header cells to the rendered table width (avoids drift when table fits viewport). */
export const buildPixelSyncedColumnWidths = (headerWidths = [], headerTableWidth = 0) => {
    if (!headerWidths?.length) return headerWidths;

    const pixels = headerWidths.map((width) => parseFloat(width));
    if (!pixels.every((value) => !Number.isNaN(value) && value > 0)) {
        return headerWidths;
    }

    const measuredTotal = sumMeasuredPixelWidths(headerWidths);
    if (!headerTableWidth || measuredTotal <= 0) {
        return pixels.map((value) => `${value}px`);
    }

    // Scrollable overflow — keep natural column widths; do not squeeze into viewport.
    if (measuredTotal > headerTableWidth + 1) {
        return pixels.map((value) => `${value}px`);
    }

    const scaled = pixels.map((value) => (value / measuredTotal) * headerTableWidth);
    const rounded = scaled.map((value) => Math.round(value * 100) / 100);
    const drift = headerTableWidth - rounded.reduce((sum, value) => sum + value, 0);
    rounded[rounded.length - 1] = Math.round((rounded[rounded.length - 1] + drift) * 100) / 100;

    return rounded.map((value) => `${value}px`);
};

/** Resolve a skeleton column width from measured header cells or column config. */
export const resolveSyncedSkeletonColumnWidth = ({
    index,
    headerWidths,
    headerTableWidth = 0,
    syncToHeader = false,
    columnConfigs = [],
    columnCount = 5,
    syncedPixelWidths = null,
}) => {
    if (syncToHeader && syncedPixelWidths?.[index]) {
        return syncedPixelWidths[index];
    }

    const synced = headerWidths?.[index];
    if (synced && syncToHeader && headerWidths?.length) {
        const total = sumMeasuredPixelWidths(headerWidths);
        const percentage = toPercentageColumnWidth(synced, total);
        if (percentage) return percentage;
    }
    if (synced) return synced;

    if (columnConfigs?.length) {
        const total = sumMeasuredPixelWidths(columnConfigs.map((col) => col?.width));
        if (total > 0) {
            const percentage = toPercentageColumnWidth(columnConfigs[index]?.width, total);
            if (percentage) return percentage;
        }
    }

    const count = headerWidths?.length || columnConfigs?.length || columnCount;
    return `${100 / count}%`;
};

/** When set, only matching rows show the detail (+) toggle (consumption expandDetails pattern). */
export const resolveExpandWhen = (expandWhen, rows) => {
    if (typeof expandWhen === 'function') return expandWhen;

    const sample = rows?.find((row) => row && typeof row === 'object');
    if (sample && Object.prototype.hasOwnProperty.call(sample, 'expandDetails')) {
        return (item) => (item?.expandDetails?.length ?? 0) > 0;
    }

    return null;
};
