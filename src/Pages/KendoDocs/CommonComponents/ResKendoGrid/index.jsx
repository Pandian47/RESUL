import { numberWithCommas } from 'Utils/modules/formatters';
/**
 * ResKendoGrid - Consolidated Kendo Grid Component
 *
 * Replaces RSCustomKendoGrid, RSKendoGrid, and RSKendoGridNew.
 * All functionality is controlled through props and variant presets.
 *
 * @example
 * // Default variant (RSKendoGrid equivalent)
 * <ResKendoGrid variant="default" data={data} columns={columns} />
 *
 * // Custom variant (RSCustomKendoGrid equivalent)
 * <ResKendoGrid variant="custom" data={data} columns={columns} filterable />
 *
 * // Advanced variant (full features)
 * <ResKendoGrid variant="advanced" data={data} columns={columns} />
 *
 * // Grouped variant (RSKendoGridNew equivalent)
 * <ResKendoGrid variant="grouped" data={data} staticColumns={staticColumns} />
 *
 * // Feature-object approach
 * <ResKendoGrid features={{ paging: true, sorting: true, filtering: true }} />
 */
import { cloneElement, isValidElement, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import {
    Grid,
    GridColumn,
    GridColumn as Column,
    GridGroupCell,
    GridHierarchyCell,
    GridNoRecords,
    GridToolbar,
} from '@progress/kendo-react-grid';
import { Input } from '@progress/kendo-react-inputs';
import { process } from '@progress/kendo-data-query';
import { processGridData } from 'Utils/GridDataProcessing';

import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';

// Local imports
import { GRID_CONFIG, gridClass, PAGER_CONFIG, PAGER_LAYOUT_CLASS, INITIAL_CONFIG, INITIAL_CONFIG_AUTO, SCROLL_MODES, MAX_EMPTY_GRID_COLUMNS, DEFAULT_PENDING_COLUMN_WIDTH } from './config';
import {
    ColumnMenu,
    ColumnMenuCheckboxFilter,
    isColumnActive,
} from './constants';

import {
    resolveFeatureFlags,
    detectChangeType,
    hasActiveFilters,
    flattenData,
    formatGridCellDisplayValue,
    getGridCellTooltipText,
    buildDetailExpandFromData,
    resolveDataItemKey,
    resolveExpandWhen,
    buildPendingGridColumns,
    resolveEffectiveSkeletonColumnCount,
    resolveSkeletonColumnConfigs,
    sumMeasuredPixelWidths,
} from './utils';

import {
    useIconReplacements,
    useFilterPopupClasses,
    useGridActionDropdownOverflow,
    useFilterCheckboxSync,
    useFilterMenuLoadingLock,
    useFilterLogicButtonGroup,
    useSinglePageSizeDisable,
    usePaginationInfoFormat,
    useCalendarIconReplace,
    useCloseIconReplace,
    useDragClueStyle,
    useGroupingIconReplace,
    useSearchIconToolbar,
    useHideFirstLastNav,
    useGridInitialLoadState,
} from './hooks';

import GridLoadingSkeleton from './GridLoadingSkeleton';
import GridLoadingSkeletonRow from './GridLoadingSkeletonRow';
import TruncatedCell, { TruncatedGridHeaderCell, getGridCellDomProps } from './TruncateCell';
import ResPager from 'CommonComponents/ResPager';


const CUSTOM_HEADER_CELL_CLASS = 'res-kendo-custom-header-cell';

const mergeHeaderClassNames = (...classNames) => classNames.filter(Boolean).join(' ');

const mergeCellTdProps = (tdProps, style, className) => ({
    ...tdProps,
    className: mergeHeaderClassNames(tdProps?.className, className),
    style: { ...(tdProps?.style || {}), ...(style || {}) },
});

const getLegacyTdTextValue = (children) => {
    if (children == null) return '';
    if (typeof children === 'string' || typeof children === 'number') return children;
    return null;
};

const buildTruncateCellRenderer = (col) => (props) => {
    const rawValue = props?.dataItem?.[props.field];
    const extraStyle = typeof col?.cellStyle === 'function' ? col.cellStyle(props) : undefined;

    return (
        <TruncatedCell
            value={formatGridCellDisplayValue(rawValue)}
            tooltipText={getGridCellTooltipText(rawValue)}
            tdProps={mergeCellTdProps(props.tdProps, extraStyle)}
            className={props.className}
        />
    );
};

/** Legacy custom cells that return `<td>{text}</td>` are auto-wrapped with TruncatedCell. */
const wrapLegacyCustomCell = (customCell, col) => (props) => {
    if (col?.truncate === false) {
        return customCell(props);
    }

    const result = customCell(props);

    if (!isValidElement(result) || result.type !== 'td') {
        return result;
    }

    const legacyValue = getLegacyTdTextValue(result.props.children);
    if (legacyValue === null) {
        return result;
    }

    const extraStyle = typeof col?.cellStyle === 'function' ? col.cellStyle(props) : undefined;
    const { style, className, children: _children, ...restTdProps } = result.props;

    return (
        <TruncatedCell
            value={formatGridCellDisplayValue(legacyValue)}
            tooltipText={getGridCellTooltipText(legacyValue)}
            tdProps={mergeCellTdProps(
                { ...props.tdProps, ...restTdProps },
                { ...style, ...extraStyle },
                className,
            )}
            className={props.className}
        />
    );
};

const resolveColumnCellRenderer = (col) => {
    const customCell = col?.cell;

    if (customCell) {
        return wrapLegacyCustomCell(customCell, col);
    }

    if (col?.truncate === false) {
        return undefined;
    }

    return buildTruncateCellRenderer(col);
};

const buildTruncatedHeaderCell = ({ titleText, titleLength, isActiveColumn, showColumnMenu }) => (props) => {
    const { thProps, children, columnMenuWrapperProps, onClick } = props;

    return (
        <TruncatedGridHeaderCell
            thProps={thProps}
            children={children}
            columnMenuWrapperProps={columnMenuWrapperProps}
            onClick={onClick}
            title={titleText}
            titleLength={titleLength}
            isActiveColumn={isActiveColumn}
            showColumnMenu={showColumnMenu}
        />
    );
};

/** Kendo v15 reads custom headers from cells.headerCell and expects a th root with thProps. */
const wrapGridHeaderCell = (renderer) => (props) => {
    const { thProps, children: _defaultHeaderContent, ...headerProps } = props;
    const domThProps = getGridCellDomProps(thProps);
    const content = renderer({ ...headerProps, thProps });
    const mergedClassName = mergeHeaderClassNames(domThProps?.className, CUSTOM_HEADER_CELL_CLASS);

    if (isValidElement(content) && content.type === 'th') {
        return cloneElement(content, {
            ...domThProps,
            className: mergeHeaderClassNames(mergedClassName, content.props?.className),
        });
    }

    return (
        <th {...domThProps} className={mergedClassName}>
            {content}
        </th>
    );
};

// ============================================================================
// ResKendoGrid Component
// ============================================================================

const ResKendoGrid = ({
    // Data
    data = [],
    columns: column = [],
    settings,
    config,

    // Variant & features
    variant = 'default',
    features,

    // Individual feature toggles (override variant preset & features object)
    pageable = true,
    sortable,
    filterable,
    groupable,
    resizable,
    reorderable,
    selectable,
    searchable,

    // Data operations
    isDataStateRequired = false,
    onDataStateChange = () => { },
    dataState: controlledDataState,
    initialDataState,
    initialFilter = null,

    // UI behaviour
    scrollable = 'none',
    isLoading = false,
    hasLoaded,
    loadResetKey,
    noDataText = '',
    noDataShowIcon = true,
    noBoxShadow = false,
    isListTable = true,
    isConsumption = false,
    customSettingsClassName = '',
    isCustomClass = '',
    skeletonColumns,
    skeletonRows,
    showHeader = true,

    // Pagination
    hidePaginationInfo = false,
    hideFirstLastNav = false,
    pageSizes: customPageSizes,
    autoResizeSize = false,

    // Events
    callbackFilterChange = () => { },
    onPageSizeChange = () => { },
    change,
    pagerChange = false,
    setInitialPagination = () => { },
    flag = false,

    // Legacy flags
    isScrollTop = true,
    isFullData = false,

    // Grouped variant props
    staticColumns = [],
    groupedColumns = [],
    selectedChannel = 'All channels',
    hideGroupingHeader = false,

    // Other
    ...rest
}) => {
    // -- Resolve variant & feature flags --
    const propOverrides = {
        sorting: sortable,
        filtering: filterable,
        grouping: groupable,
        resizing: resizable,
        reordering: reorderable,
        selection: selectable,
        searching: searchable,
    };
    const flags = resolveFeatureFlags(variant, features, propOverrides);

    const isGroupedVariant = variant === 'grouped';

    const hasColumnSchema = (column ?? []).length > 0;
    const resolvedInitialLoad = useGridInitialLoadState(isLoading, loadResetKey, hasColumnSchema);
    const effectiveHasLoaded = hasLoaded ?? resolvedInitialLoad;

    // Keep skeleton visible until first fetch completes — avoids "No records found" flash
    const isGridPending = isLoading || !effectiveHasLoaded;

    const effectiveSkeletonColumnCount = useMemo(
        () => resolveEffectiveSkeletonColumnCount(skeletonColumns, column, { isGridPending }),
        [skeletonColumns, column, isGridPending],
    );

    // -- Refs --
    const gridRef = useRef(null);
    const prevDataStateRef = useRef({});

    // -- Window size (for autoResizeSize) --
    const { height, pageSize: windowPageSize } = useWindowSize();

    // ========================================================================
    // GROUPED VARIANT STATE (RSKendoGridNew)
    // ========================================================================
    const [groupedInternalDataState, setGroupedInternalDataState] = useState(() => ({
        skip: 0,
        take: 5,
        group: [],
        sort: [],
        ...(initialDataState && typeof initialDataState === 'object' ? initialDataState : {}),
    }));
    const [searchValue, setSearchValue] = useState('');
    const [collapsedGroupKeys, setCollapsedGroupKeys] = useState([]);
    const collapsedGroupKeySet = useMemo(() => new Set(collapsedGroupKeys), [collapsedGroupKeys]);

    // ========================================================================
    // DEFAULT/CUSTOM/ADVANCED VARIANT STATE (RSKendoGrid/RSCustomKendoGrid)
    // ========================================================================
    const [pageuserGrid, setPageUserGrid] = useState(() => {
        const base = (() => {
            if (autoResizeSize) return INITIAL_CONFIG_AUTO(windowPageSize);
            if (config && (config.take != null || config.skip != null)) {
                return {
                    ...INITIAL_CONFIG,
                    take: config.take ?? INITIAL_CONFIG.take,
                    skip: config.skip ?? INITIAL_CONFIG.skip,
                };
            }
            return INITIAL_CONFIG;
        })();
        return initialFilter ? { ...base, filter: initialFilter } : base;
    });
    const [settingsConfig, setSettingsConfig] = useState(settings);
    const [pagination, setPagination] = useState(config);

    // Process data for display vs filter (date/numeric conversions)
    const { displayData, filterData } = useMemo(() => {
        if (isGroupedVariant) return { displayData: data, filterData: data };
        return processGridData(data, column);
    }, [data, column, isGroupedVariant]);

    const [pageUser, setPageUser] = useState(isGroupedVariant ? data : filterData);

    // ========================================================================
    // AUTO-RESIZE PAGE SIZE
    // ========================================================================
    useSkipFirstRender(() => {
        if (!autoResizeSize) return;
        if (isDataStateRequired) {
            onPageSizeChange?.({ take: windowPageSize, skip: 1 });
        } else {
            const newState = { ...pageuserGrid, skip: 0, take: windowPageSize };
            const safeData =
                filterData?.length && Array.isArray(filterData) ? filterData : [];
            const processed = process(safeData, newState);
            setPageUser(processed?.data);
        }
        setPageUserGrid((prev) => ({ ...prev, take: windowPageSize, skip: 0 }));
    }, [windowPageSize]);

    // ========================================================================
    // FILTERED TOTAL (for custom/default variants)
    // ========================================================================
    const filteredTotal = useMemo(() => {
        if (isGroupedVariant) return 0;
        if (isDataStateRequired) {
            return _get(settingsConfig, 'total', _get(settings, 'total', 0));
        }
        if (!filterData?.length) return 0;

        const hasActiveFilter =
            pageuserGrid?.filter &&
            pageuserGrid.filter.filters &&
            Array.isArray(pageuserGrid.filter.filters) &&
            pageuserGrid.filter.filters.length > 0;

        if (!hasActiveFilter) {
            return filterData.length;
        }
        const filterState = {
            skip: 0,
            take: filterData.length,
            filter: pageuserGrid?.filter,
            sort: undefined,
        };
        const processed = process(filterData, filterState);
        return processed?.total || 0;
    }, [
        filterData,
        pageuserGrid?.filter,
        settingsConfig?.total,
        settings?.total,
        isDataStateRequired,
        isGroupedVariant,
    ]);

    // ========================================================================
    // PAGE CONFIG
    // ========================================================================
    const pageConfig = useMemo(() => {
        if (isGroupedVariant) return null; // Grouped handles its own pager

        if (autoResizeSize) {
            const sizes = [windowPageSize];
            if (isDataStateRequired) {
                if (_get(settings, 'total', 0) <= windowPageSize) return false;
                if (windowPageSize * 2 <= _get(settings, 'total', 0)) sizes.push(windowPageSize * 2);
                if (windowPageSize * 3 <= _get(settings, 'total', 0)) sizes.push(windowPageSize * 3);
            } else {
                const filteredTotalLocal = _get(settingsConfig, 'total', null);
                const total = filteredTotalLocal !== null ? filteredTotalLocal : _get(settings, 'total', 0);
                const actualDataLength = data?.length || 0;
                const effectiveTotal =
                    filteredTotalLocal !== null
                        ? filteredTotalLocal
                        : total > 0
                            ? Math.min(total, actualDataLength)
                            : actualDataLength;
                if (effectiveTotal <= windowPageSize) return false;
                sizes.push(windowPageSize * 2);
                if (windowPageSize * 3 <= effectiveTotal) sizes.push(windowPageSize * 3);
            }
            return {
                info: !hidePaginationInfo,
                pageSizes: sizes,
                previousNext: true,
                buttonCount: 4,
            };
        }

        // Custom variant page config (dynamic based on filteredTotal)
        if (variant === 'custom') {
            const total = filteredTotal;
            if (total <= windowPageSize) return false;
            const sizes = [windowPageSize];
            if (windowPageSize * 2 <= total) sizes.push(windowPageSize * 2);
            if (windowPageSize * 3 <= total) sizes.push(windowPageSize * 3);
            if (sizes.length < 2) {
                const nextSize = total > windowPageSize ? 10 : windowPageSize * 2;
                if (!sizes.includes(nextSize)) sizes.push(nextSize);
            }
            return {
                info: !hidePaginationInfo,
                pageSizes: sizes,
                previousNext: true,
                buttonCount: 4,
            };
        }

        // Default/Advanced: standard pager
        const filteredTotalLocal = _get(settingsConfig, 'total', null);
        const totalToCheck =
            filteredTotalLocal !== null ? filteredTotalLocal : _get(settings, 'total', 0);
        return totalToCheck > 5
            ? { ...PAGER_CONFIG, info: !hidePaginationInfo, previousNext: true }
            : false;
    }, [
        windowPageSize,
        settings?.total,
        settingsConfig?.total,
        data?.length,
        hidePaginationInfo,
        autoResizeSize,
        isDataStateRequired,
        variant,
        filteredTotal,
        isGroupedVariant,
    ]);

    const pageableSettings = useMemo(() => {
        if (isGroupedVariant) return null; // handled separately
        if (variant === 'custom') {
            return pageUser?.length > 0 && (pageable || filteredTotal > windowPageSize)
                ? pageConfig
                : false;
        }
        return pageable ? pageConfig : false;
    }, [variant, pageable, pageConfig, pageUser, filteredTotal, windowPageSize, isGroupedVariant]);

    // ========================================================================
    // HOOKS — Icon replacements, filter popups, pagination formatting
    // ========================================================================
    useIconReplacements(gridRef, [
        data,
        column,
        settings,
        staticColumns,
        selectedChannel,
        pageuserGrid?.filter,
        pageuserGrid?.sort,
    ]);
    useFilterLogicButtonGroup();
    useFilterPopupClasses();
    useGridActionDropdownOverflow();
    useFilterCheckboxSync();
    useFilterMenuLoadingLock(gridRef, isLoading);
    useSinglePageSizeDisable(pageConfig);
    useCalendarIconReplace();
    useHideFirstLastNav(hideFirstLastNav, [data, column, settings]);
    useCloseIconReplace([flags.grouping, data, column, staticColumns]);
    useDragClueStyle(flags.grouping, [flags.grouping, data, column, staticColumns]);
    useGroupingIconReplace(flags.grouping, [flags.grouping, data, column, staticColumns]);

    // Pagination info formatting
    const wrapperSelector = isGroupedVariant
        ? `.${GRID_CONFIG.className}-new-wrapper`
        : `.${GRID_CONFIG.className}-table, .${GRID_CONFIG.className}-list-table`;

    usePaginationInfoFormat(wrapperSelector, {
        pageable,
        isLoading,
        hidePaginationInfo,
        total: settingsConfig?.total || settings?.total,
        skip: isGroupedVariant ? groupedInternalDataState.skip : pageuserGrid?.skip,
        take: isGroupedVariant ? groupedInternalDataState.take : pageuserGrid?.take,
    });

    // Grouped-specific hooks
    if (isGroupedVariant) {
        useSearchIconToolbar(`.${GRID_CONFIG.className}-new-wrapper`, {
            searchable: flags.searching,
            isLoading,
        });
    }

    // ========================================================================
    // DATA PROCESSING — DEFAULT/CUSTOM/ADVANCED VARIANTS
    // ========================================================================
    useEffect(() => {
        if (isGroupedVariant) return;
        if (pagerChange) {
            if (autoResizeSize) {
                const base = INITIAL_CONFIG_AUTO(windowPageSize);
                setPageUserGrid(initialFilter ? { ...base, filter: initialFilter } : base);
            } else {
                setPageUserGrid(
                    initialFilter ? { ...INITIAL_CONFIG, filter: initialFilter } : INITIAL_CONFIG,
                );
            }
            setInitialPagination(false);
        }
    }, [pagerChange]);

    useLayoutEffect(() => {
        if (isGroupedVariant) return;

        if (isDataStateRequired) {
            setPageUser(data);
            setSettingsConfig(settings);
        } else {
            let result;
            let updatedGrid;

            if (data && pageuserGrid) {
                // Clean up filters for invalid values
                let cleanedFilter = pageuserGrid.filter;
                if (cleanedFilter?.filters?.length) {
                    const newFilters = cleanedFilter.filters
                        .map((filterGroup) => {
                            if (!filterGroup.filters) return filterGroup;
                            const field = filterGroup.filters[0]?.field;
                            if (!field) return filterGroup;

                            const availableValues = new Set(
                                filterData.map((item) => item[field]),
                            );
                            const validFilters = filterGroup.filters.filter((f) =>
                                availableValues.has(f.value),
                            );

                            if (validFilters.length === filterGroup.filters.length)
                                return filterGroup;
                            if (validFilters.length === 0) return null;
                            return { ...filterGroup, filters: validFilters };
                        })
                        .filter(Boolean);

                    if (
                        newFilters.length !== cleanedFilter.filters.length ||
                        newFilters.some((f, i) => f !== cleanedFilter.filters[i])
                    ) {
                        cleanedFilter = { ...cleanedFilter, filters: newFilters };
                        if (newFilters.length === 0) cleanedFilter = undefined;
                    }
                }

                const adjustedSkip =
                    pageuserGrid.skip >= data.length ? 0 : pageuserGrid.skip;
                const adjustedGridState = {
                    ...pageuserGrid,
                    filter: cleanedFilter,
                    skip: adjustedSkip,
                };

                const processedData = process(
                    filterData?.length ? filterData : data,
                    adjustedGridState,
                );
                const displayResults = processedData?.data.map((filteredItem) => {
                    const originalItem = displayData.find((item) =>
                        Object.keys(item).every((key) =>
                            column.find(
                                (col) => col.field === key && col.filter === 'date',
                            )
                                ? true
                                : item[key] === filteredItem[key],
                        ),
                    );
                    return originalItem || filteredItem;
                });
                result = displayResults;
                updatedGrid = {
                    skip: adjustedSkip,
                    take: pageuserGrid.take,
                    filter: cleanedFilter,
                    sort: pageuserGrid.sort,
                };

                const hasFilters =
                    cleanedFilter &&
                    cleanedFilter.filters &&
                    cleanedFilter.filters.length > 0;
                if (hasFilters) {
                    setSettingsConfig((prev) => ({
                        ...prev,
                        total: processedData?.total,
                    }));
                } else {
                    setSettingsConfig(settings);
                }
            } else {
                result = data;
                if (autoResizeSize) {
                    updatedGrid = INITIAL_CONFIG_AUTO(windowPageSize);
                } else if (config && (config.take != null || config.skip != null)) {
                    updatedGrid = {
                        ...INITIAL_CONFIG,
                        take: config.take ?? INITIAL_CONFIG.take,
                        skip: config.skip ?? INITIAL_CONFIG.skip,
                    };
                } else {
                    updatedGrid = INITIAL_CONFIG;
                }
                setSettingsConfig(settings);
            }

            setPageUser(result);
            setPageUserGrid(updatedGrid);

            if (isFullData) {
                setPageUser(data);
            }
        }
    }, [data]);

    // ========================================================================
    // DATA STATE CHANGE HANDLER — DEFAULT/CUSTOM/ADVANCED VARIANTS
    // ========================================================================
    const dataStateChange = async (event) => {
        if (isGroupedVariant) return;

        const currentState = event.dataState;
        const isFilterCleared =
            !currentState?.filter ||
            !Array.isArray(currentState.filter.filters) ||
            currentState.filter.filters.length === 0;
        const normalizedState =
            initialFilter && isFilterCleared
                ? { ...currentState, filter: initialFilter, skip: 0 }
                : currentState;
        const prevState = pageuserGrid;

        const { pagingChanged, sortingChanged, filteringChanged } = detectChangeType(
            prevState,
            normalizedState,
        );

        // Check for filter clear
        const prevHasFilters =
            prevState?.filter &&
            prevState.filter.filters &&
            Array.isArray(prevState.filter.filters) &&
            prevState.filter.filters.length > 0;
        const currentHasFilters =
            normalizedState?.filter &&
            normalizedState.filter.filters &&
            Array.isArray(normalizedState.filter.filters) &&
            normalizedState.filter.filters.length > 0;
        const filtersCleared = prevHasFilters && !currentHasFilters;

        if (filteringChanged) {
            callbackFilterChange(normalizedState.filter ?? null);
        }

        if (flag) {
            if (filteringChanged || sortingChanged) {
                setPageUserGrid(normalizedState);
                if (filterData?.length) {
                    const processed = process(filterData, normalizedState);
                    const displayResults = processed?.data.map((filteredItem) => {
                        const originalItem = displayData.find((item) =>
                            Object.keys(item).every((key) =>
                                column.find(
                                    (col) => col.field === key && col.filter === 'date',
                                )
                                    ? true
                                    : item[key] === filteredItem[key],
                            ),
                        );
                        return originalItem || filteredItem;
                    });
                    setPageUser(displayResults);

                    const hasFiltersNow =
                        normalizedState.filter &&
                        normalizedState.filter.filters &&
                        normalizedState.filter.filters.length > 0;
                    setSettingsConfig((prev) => ({
                        ...prev,
                        total: hasFiltersNow
                            ? processed?.total
                            : _get(settings, 'total', 0),
                    }));
                }
                return;
            }

            setPagination((prevState) => ({
                ...prevState,
                skip: normalizedState.skip,
                take: normalizedState.take,
            }));
            change?.(normalizedState);
            setPageUserGrid(normalizedState);
        } else {
            if (isDataStateRequired) {
                if (pagingChanged && !filteringChanged && !sortingChanged) {
                    const cleanedState = {
                        ...normalizedState,
                        sort: [],
                        filter: { logic: 'and', filters: [] },
                    };
                    prevDataStateRef.current = cleanedState;
                    setPageUserGrid(cleanedState);
                    await onDataStateChange({ ...event, dataState: cleanedState });
                } else if (filteringChanged || sortingChanged) {
                    let newState;
                    if (filtersCleared) {
                        newState = {
                            skip: 0,
                            take: prevState.take || windowPageSize,
                            sort: normalizedState.sort,
                        };
                    } else {
                        newState = { ...normalizedState, skip: 0 };
                    }

                    if (!pageable) {
                        newState.take = filterData?.length || data?.length || 0;
                        newState.skip = 0;
                    }

                    const processed = process(filterData, newState);
                    const displayResults = processed?.data.map((filteredItem) => {
                        const originalItem = displayData.find((item) =>
                            Object.keys(item).every((key) =>
                                column.find(
                                    (col) => col.field === key && col.filter === 'date',
                                )
                                    ? true
                                    : item[key] === filteredItem[key],
                            ),
                        );
                        return originalItem || filteredItem;
                    });
                    setPageUser(displayResults);
                    setPageUserGrid((prev) => ({
                        ...prev,
                        filter: normalizedState.filter,
                        sort: normalizedState.sort,
                        skip: filtersCleared ? 0 : prev.skip,
                        take: prev.take,
                    }));
                    setSettingsConfig((prev) => ({
                        ...prev,
                        total: processed?.total || 0,
                    }));

                    if (filtersCleared) {
                        setPageUserGrid(newState);
                        await onDataStateChange({ ...event, dataState: newState });
                    }
                }
            } else {
                if (filterData?.length || data?.length) {
                    let resetState;
                    if (filtersCleared) {
                        resetState = {
                            skip: 0,
                            take: prevState.take || windowPageSize,
                            sort: normalizedState.sort,
                        };
                    } else {
                        resetState = normalizedState;
                    }

                    setPageUserGrid(resetState);
                    const processed = process(filterData, resetState);
                    const displayResults = processed?.data.map((filteredItem) => {
                        const originalItem = displayData.find((item) =>
                            Object.keys(item).every((key) =>
                                column.find(
                                    (col) => col.field === key && col.filter === 'date',
                                )
                                    ? true
                                    : item[key] === filteredItem[key],
                            ),
                        );
                        return originalItem || filteredItem;
                    });
                    setPageUser(displayResults);

                    const hasActiveFilter =
                        normalizedState?.filter &&
                        normalizedState.filter.filters &&
                        Array.isArray(normalizedState.filter.filters) &&
                        normalizedState.filter.filters.length > 0;

                    const totalCount =
                        filtersCleared || !hasActiveFilter
                            ? filterData.length
                            : processed?.total || 0;

                    setSettingsConfig((prev) => ({
                        ...prev,
                        total: totalCount,
                    }));
                } else {
                    setSettingsConfig(settings);
                }
            }
        }
        isScrollTop && window.scrollTo(0, 0);
    };

    // ========================================================================
    // GROUPED VARIANT — Data processing
    // ========================================================================
    const groupedEffectiveDataState = useMemo(() => {
        if (!isGroupedVariant) return null;
        if (!controlledDataState) return groupedInternalDataState;
        return { ...groupedInternalDataState, ...controlledDataState };
    }, [controlledDataState, groupedInternalDataState, isGroupedVariant]);

    useEffect(() => {
        if (!isGroupedVariant) return;
        setCollapsedGroupKeys([]);
    }, [groupedEffectiveDataState?.group]);

    const applyGroupExpansion = useCallback(
        (items, parentKey = '') => {
            if (!Array.isArray(items)) return items;

            const normalizeValue = (value) => {
                if (value === null) return 'null';
                if (value === undefined) return 'undefined';
                if (value instanceof Date) return value.toISOString();
                if (typeof value === 'object') {
                    try {
                        return JSON.stringify(value);
                    } catch (e) {
                        return String(value);
                    }
                }
                return String(value);
            };

            return items.map((item) => {
                const isGroupItem =
                    item &&
                    typeof item === 'object' &&
                    Array.isArray(item.items) &&
                    Object.prototype.hasOwnProperty.call(item, 'field') &&
                    Object.prototype.hasOwnProperty.call(item, 'value');

                if (!isGroupItem) return item;

                const valueKey = normalizeValue(item.value);
                const groupKey = parentKey
                    ? `${parentKey}|${item.field}:${valueKey}`
                    : `${item.field}:${valueKey}`;
                const expanded = !collapsedGroupKeySet.has(groupKey);

                return {
                    ...item,
                    expanded,
                    __rsGroupKey: groupKey,
                    items: applyGroupExpansion(item.items, groupKey),
                };
            });
        },
        [collapsedGroupKeySet],
    );

    const handleExpandChange = useCallback((event) => {
        const key = event?.dataItem?.__rsGroupKey;
        if (!key) return;

        const nextExpanded =
            typeof event?.value === 'boolean'
                ? event.value
                : !Boolean(event?.dataItem?.expanded);

        setCollapsedGroupKeys((prev) => {
            const next = new Set(prev);
            if (nextExpanded) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return Array.from(next);
        });
    }, []);

    const groupedFlattenedData = useMemo(() => {
        if (!isGroupedVariant) return [];
        return flattenData(data, { groupable: flags.grouping, selectedChannel });
    }, [data, flags.grouping, selectedChannel, isGroupedVariant]);

    const groupedSearchedData = useMemo(() => {
        if (!isGroupedVariant) return [];
        if (!flags.searching || !searchValue || !groupedFlattenedData.length)
            return groupedFlattenedData;

        return groupedFlattenedData.filter((item) =>
            Object.values(item).some((value) => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(searchValue.toLowerCase());
            }),
        );
    }, [groupedFlattenedData, searchValue, flags.searching, isGroupedVariant]);

    const groupedProcessedData = useMemo(() => {
        if (!isGroupedVariant)
            return { data: [], total: 0 };
        if (!groupedSearchedData || groupedSearchedData.length === 0)
            return { data: [], total: 0 };

        if (isDataStateRequired) {
            const total = Number(settings?.total ?? 0);
            const safeTotal = Number.isFinite(total) ? total : 0;
            const localState = {
                ...groupedEffectiveDataState,
                skip: 0,
                take: groupedSearchedData.length,
            };
            const processed = process(groupedSearchedData, localState);
            return { data: applyGroupExpansion(processed?.data), total: safeTotal };
        }

        const processed = process(groupedSearchedData, groupedEffectiveDataState);
        return { ...processed, data: applyGroupExpansion(processed?.data) };
    }, [
        groupedSearchedData,
        groupedEffectiveDataState,
        isDataStateRequired,
        settings?.total,
        applyGroupExpansion,
        isGroupedVariant,
    ]);

    const handleGroupedDataStateChange = (e) => {
        setGroupedInternalDataState(e.dataState);
        onDataStateChange(e);
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        setGroupedInternalDataState((prev) => ({ ...prev, skip: 0 }));
    };

    // ========================================================================
    // GROUPED VARIANT — Column generation
    // ========================================================================
    const generateGroupedColumns = () => {
        if (!data || data.length === 0) return null;

        const dateArray = data[0]?.dateCategory || data[0]?.date_Category;
        const allChannelArrays = ['sms', 'email', 'whatsApp'];
        const channelArrays =
            selectedChannel === 'All channels'
                ? allChannelArrays
                : allChannelArrays.filter(
                    (c) => c.toLowerCase() === selectedChannel.toLowerCase(),
                );

        if (dateArray && Array.isArray(dateArray)) {
            return dateArray.map((entry, idx) => {
                const channels = Object.keys(entry).filter((key) => key !== 'date');
                const isOddGroup = (idx + 1) % 2 === 1;
                const headerClassName = `grouped-header grouped-header-date ${isOddGroup ? 'grouped-date-odd' : ''}`;

                return (
                    <Column key={idx} title={entry.date} headerClassName={headerClassName}>
                        {channels.map((channel, i) => {
                            const channelTitle =
                                channel.toLowerCase() === 'sms'
                                    ? 'SMS'
                                    : channel.charAt(0).toUpperCase() + channel.slice(1);
                            const channelClassName = `grouped-header-channel ${isOddGroup ? 'grouped-date-odd' : ''}`;

                            return (
                                <Column
                                    key={i}
                                    field={`${entry.date}_${channel}`}
                                    title={channelTitle}
                                    width="120px"
                                    headerClassName={channelClassName}
                                    cell={(props) => {
                                        const value =
                                            props?.dataItem?.[`${entry.date}_${channel}`];
                                        return (
                                            <td
                                                className={`text-right ${isOddGroup ? 'grouped-date-odd' : ''}`}
                                            >
                                                {value === null ||
                                                    value === undefined ||
                                                    value === ''
                                                    ? ''
                                                    : typeof value === 'number'
                                                        ? numberWithCommas(value)
                                                        : value === 'NA'
                                                            ? 'NA'
                                                            : value}
                                            </td>
                                        );
                                    }}
                                />
                            );
                        })}
                    </Column>
                );
            });
        }

        // New structure
        const firstItem = data[0];
        const dateSet = new Set();
        channelArrays.forEach((channel) => {
            const channelData = firstItem[channel];
            if (Array.isArray(channelData)) {
                channelData.forEach((entry) => {
                    if (entry && entry.date) dateSet.add(entry.date);
                });
            }
        });

        if (dateSet.size === 0) return null;

        const parseDate = (str) => {
            const [day, month, year] = str?.split('-');
            return new Date(`20${year}-${month}-${day}`);
        };
        const sortedDates = Array.from(dateSet).sort(
            (a, b) => parseDate(b) - parseDate(a),
        );

        return sortedDates.map((date, idx) => {
            const isOddGroup = (idx + 1) % 2 === 1;
            const headerClassName = `grouped-header grouped-header-date ${isOddGroup ? 'grouped-date-odd' : ''}`;

            return (
                <Column key={idx} title={date} headerClassName={headerClassName}>
                    {channelArrays.map((channel, i) => {
                        const channelTitle =
                            channel.toLowerCase() === 'sms'
                                ? 'SMS'
                                : channel.charAt(0).toUpperCase() + channel.slice(1);
                        const channelClassName = `grouped-header-channel ${isOddGroup ? 'grouped-date-odd' : ''}`;

                        return (
                            <Column
                                key={i}
                                field={`${date}_${channel}`}
                                title={channelTitle}
                                width="120px"
                                headerClassName={channelClassName}
                                cell={(props) => {
                                    const value = props?.dataItem?.[`${date}_${channel}`];
                                    return (
                                        <td
                                            className={`text-right ${isOddGroup ? 'grouped-date-odd' : ''}`}
                                        >
                                            {value === null ||
                                                value === undefined ||
                                                value === ''
                                                ? ''
                                                : typeof value === 'number'
                                                    ? numberWithCommas(value)
                                                    : value === 'NA'
                                                        ? 'NA'
                                                        : value}
                                        </td>
                                    );
                                }}
                            />
                        );
                    })}
                </Column>
            );
        });
    };

    const generateSimpleDateColumns = () => {
        if (!data || data.length === 0) return null;

        const allChannelArrays = ['sms', 'email', 'whatsApp'];
        const channelArrays =
            selectedChannel === 'All channels'
                ? allChannelArrays
                : allChannelArrays.filter(
                    (c) => c.toLowerCase() === selectedChannel.toLowerCase(),
                );

        const firstItem = data[0];
        let activeChannel = null;
        let dateSet = new Set();

        for (const channel of channelArrays) {
            const channelData = firstItem[channel];
            if (Array.isArray(channelData) && channelData.length > 0) {
                activeChannel = channel;
                channelData.forEach((entry) => {
                    if (entry && entry.date) dateSet.add(entry.date);
                });
                break;
            }
        }

        if (dateSet.size === 0 || !activeChannel) return null;

        const parseDate = (str) => {
            const [day, month, year] = str?.split('-');
            return new Date(`20${year}-${month}-${day}`);
        };
        const sortedDates = Array.from(dateSet).sort(
            (a, b) => parseDate(b) - parseDate(a),
        );

        return sortedDates.map((date, idx) => {
            const headerClassName = 'grouped-header grouped-header-date';
            return (
                <Column
                    key={idx}
                    field={`${date}_count`}
                    title={date}
                    width="120px"
                    headerClassName={headerClassName}
                    cell={(props) => {
                        const value = props?.dataItem?.[`${date}_count`];
                        return (
                            <td className="text-right">
                                {value === null || value === undefined || value === ''
                                    ? ''
                                    : typeof value === 'number'
                                        ? numberWithCommas(value)
                                        : value === 'NA'
                                            ? 'NA'
                                            : value}
                            </td>
                        );
                    }}
                />
            );
        });
    };

    // ========================================================================
    // SHARED — Column props helper
    // ========================================================================

    const columnProps = useCallback(
        (field) => ({
            field: field,
        }),
        [pageuserGrid],
    );

    // ========================================================================
    // SHARED — Active filters check
    // ========================================================================
    const hasActiveFiltersValue = useMemo(
        () => hasActiveFilters(isGroupedVariant ? null : pageuserGrid?.filter),
        [pageuserGrid?.filter, isGroupedVariant],
    );

    // ========================================================================
    // SHARED — Empty state detection
    // ========================================================================
    const isPageUserEmpty = useMemo(() => {
        if (isGridPending) return true;

        if (isGroupedVariant) {
            if (Array.isArray(groupedProcessedData?.data)) {
                return groupedProcessedData.data.length === 0;
            }
            return !groupedProcessedData?.data;
        }

        if (Array.isArray(pageUser) && pageUser.length > 0) return false;
        if (!hasActiveFiltersValue && Array.isArray(data) && data.length > 0) return false;
        if (Array.isArray(pageUser)) return pageUser.length === 0;
        return !pageUser;
    }, [pageUser, data, isGridPending, isGroupedVariant, groupedProcessedData, hasActiveFiltersValue]);

    const gridDisplayData = useMemo(() => {
        if (isGridPending) return [];

        if (isGroupedVariant) {
            return groupedProcessedData?.data ?? [];
        }

        if (Array.isArray(pageUser) && pageUser.length > 0) return pageUser;
        if (!hasActiveFiltersValue && Array.isArray(data) && data.length > 0) return data;
        return Array.isArray(pageUser) ? pageUser : Array.isArray(data) ? data : [];
    }, [isGridPending, isGroupedVariant, groupedProcessedData, pageUser, data, hasActiveFiltersValue]);

    // API-empty: hide real headers — skeleton renders its own blue header row.
    // Filter-empty: keep real headers; skeleton is body-only under the "No data" pill.
    const shouldHideHeader = useMemo(
        () => isPageUserEmpty && !isGridPending && !hasActiveFiltersValue,
        [isPageUserEmpty, isGridPending, hasActiveFiltersValue],
    );

    const shouldLimitEmptyColumns = useMemo(
        () => !isGroupedVariant && !isGridPending && isPageUserEmpty && !hasActiveFiltersValue,
        [isGroupedVariant, isGridPending, isPageUserEmpty, hasActiveFiltersValue],
    );

    const columnsForRender = useMemo(() => {
        let cols = column ?? [];

        if (isGridPending) {
            if (cols.length > 1) {
                // Schema known — keep real column defs so headers do not remount when data arrives.
            } else {
                cols = buildPendingGridColumns(
                    effectiveSkeletonColumnCount,
                    DEFAULT_PENDING_COLUMN_WIDTH,
                );
            }
        }

        if (shouldLimitEmptyColumns && cols.length > MAX_EMPTY_GRID_COLUMNS) {
            return cols.slice(0, MAX_EMPTY_GRID_COLUMNS);
        }
        return cols;
    }, [column, isGridPending, effectiveSkeletonColumnCount, shouldLimitEmptyColumns]);

    const emptySkeletonSyncHeader = useMemo(
        () => !shouldHideHeader && columnsForRender.length > 0,
        [shouldHideHeader, columnsForRender],
    );

    // -- Scroll class (legacy rs-kendo-* aliases kept for existing page styles) --
    const effectiveScrollable = useMemo(() => {
        if (shouldLimitEmptyColumns) return 'none';
        if (scrollable === 'scrollable' || scrollable === true) return 'scrollable';
        if (!isLoading || isGroupedVariant) return scrollable;
        const configs = resolveSkeletonColumnConfigs(column ?? []);
        const total = sumMeasuredPixelWidths(configs.map((col) => col?.width));
        if (total > 800 || configs.length > 6) return 'scrollable';
        return scrollable;
    }, [scrollable, isLoading, isGroupedVariant, column, shouldLimitEmptyColumns]);

    const scrollSettings = useMemo(
        () =>
            effectiveScrollable === 'none'
                ? `${SCROLL_MODES.none} rs-kendo-fixed-grid`
                : `${SCROLL_MODES.scrollable} rs-kendo-scrollable-grid`,
        [effectiveScrollable],
    );

    // ========================================================================
    // GROUPED VARIANT — Pager config
    // ========================================================================
    const groupedPageableSettings = useMemo(() => {
        if (!isGroupedVariant) return false;
        if (
            !pageable ||
            isLoading ||
            isPageUserEmpty ||
            groupedProcessedData.total < 4
        )
            return false;
        return {
            buttonCount: 5,
            info: true,
            type: 'numeric',
            pageSizes: (customPageSizes || [5, 10, 20]).filter(
                (size) =>
                    size <= groupedProcessedData.total ||
                    size === (customPageSizes?.[0] || 5),
            ),
            previousNext: true,
        };
    }, [
        isGroupedVariant,
        pageable,
        isLoading,
        isPageUserEmpty,
        groupedProcessedData.total,
        customPageSizes,
    ]);

    const activePagerSettings = isGroupedVariant ? groupedPageableSettings : pageableSettings;

    const showExternalPager = useMemo(() => {
        if (isGridPending) return false;
        return Boolean(activePagerSettings);
    }, [isGridPending, activePagerSettings]);

    const pagerTotal = useMemo(() => {
        if (isGroupedVariant) {
            return isPageUserEmpty ? 0 : (groupedProcessedData?.total ?? 0);
        }
        if (isDataStateRequired) {
            return _get(settingsConfig, 'total', _get(settings, 'total', 0));
        }
        const configTotal = _get(settingsConfig, 'total', null);
        if (configTotal !== null) return configTotal;
        return filteredTotal;
    }, [
        isGroupedVariant,
        isPageUserEmpty,
        groupedProcessedData?.total,
        isDataStateRequired,
        settingsConfig,
        settings,
        filteredTotal,
    ]);

    const externalPagerConfig = useMemo(() => {
        if (!showExternalPager || !activePagerSettings) return null;
        const state = isGroupedVariant ? groupedEffectiveDataState : pageuserGrid;
        return {
            skip: state?.skip ?? 0,
            take: state?.take ?? INITIAL_CONFIG.take,
            info: activePagerSettings.info,
            pageSizes: activePagerSettings.pageSizes,
            previousNext: activePagerSettings.previousNext ?? true,
            buttonCount: activePagerSettings.buttonCount ?? 4,
            responsive: activePagerSettings.responsive ?? true,
            type: activePagerSettings.type,
        };
    }, [
        showExternalPager,
        activePagerSettings,
        isGroupedVariant,
        groupedEffectiveDataState,
        pageuserGrid,
    ]);

    const handleExternalPagerChange = ({ skip, take }) => {
        dataStateChange({
            dataState: {
                ...pageuserGrid,
                skip,
                take,
            },
        });
    };

    const handleGroupedExternalPagerChange = ({ skip, take }) => {
        handleGroupedDataStateChange({
            dataState: {
                ...groupedEffectiveDataState,
                skip,
                take,
            },
        });
    };

    const renderExternalPager = () => {
        if (!showExternalPager || !externalPagerConfig) return null;

        return (
            <div className={PAGER_LAYOUT_CLASS}>
                <ResPager
                    isServerSide
                    total={pagerTotal}
                    config={externalPagerConfig}
                    onPageChange={
                        isGroupedVariant
                            ? handleGroupedExternalPagerChange
                            : handleExternalPagerChange
                    }
                    className={activePagerSettings?.className || PAGER_CONFIG.className || ''}
                    noBoxShadow ={noBoxShadow}
                />
            </div>
        );
    };

    // ========================================================================
    // BEM WRAPPER CLASSES
    // ========================================================================
    const hasCustomHeaderColumns = useMemo(
        () => column?.some((col) => typeof col?.headerCell === 'function'),
        [column],
    );

    const wrapperClasses = useMemo(() => {
        if (isGroupedVariant) {
            return [
                `${GRID_CONFIG.className}-new-wrapper rs-kendo-grid-new-wrapper`,
                `${GRID_CONFIG.className}-table rs-kendo-grid-table`,
                gridClass(),
                gridClass('grouped'),
                isGridPending && 'grid-loading-state',
                flags.searching ? '' : 'search-hidden',
            ]
                .filter(Boolean)
                .join(' ');
        }

        return [
            isListTable ? `${GRID_CONFIG.className}-table rs-kendo-grid-table` : `${GRID_CONFIG.className}-list-table rs-kendo-list-table`,
            gridClass(),
            isCustomClass,
            hasCustomHeaderColumns && `${GRID_CONFIG.className}--custom-header`,
            isGridPending && 'grid-loading-state',
            flags.sorting && gridClass('sortable'),
            flags.filtering && gridClass('filterable'),
            flags.grouping && gridClass('groupable'),
            flags.resizing && gridClass('resizable'),
            flags.reordering && gridClass('reorderable'),
            flags.selection && gridClass('selectable'),
        ]
            .filter(Boolean)
            .join(' ');
    }, [isGroupedVariant, isListTable, isCustomClass, hasCustomHeaderColumns, isGridPending, flags]);

    const innerGridClasses = useMemo(() => {
        if (isGroupedVariant) {
            return [
                `${GRID_CONFIG.className}-scrollable-grid rs-kendo-scrollable-grid`,
                isPageUserEmpty && !isGridPending && 'noDataAvailable',
                shouldHideHeader && 'hide-grid-header',
                isGridPending && 'grid-loading-state',
            ]
                .filter(Boolean)
                .join(' ');
        }

        return [
            noBoxShadow && 'no-box-shadow',
            scrollSettings,
            data?.length > 5 ? '' : 'mb0',
            isPageUserEmpty && !isGridPending && 'noDataAvailable',
            customSettingsClassName,
            shouldHideHeader && 'hide-grid-header',
            isGridPending && 'grid-loading-state',
            isConsumption && isPageUserEmpty && !hasActiveFiltersValue && !isLoading && 'consumptionNodata',
        ]
            .filter(Boolean)
            .join(' ');
    }, [
        isGroupedVariant,
        noBoxShadow,
        scrollSettings,
        data,
        customSettingsClassName,
        shouldHideHeader,
        isGridPending,
        isLoading,
        isConsumption,
        isPageUserEmpty,
        hasActiveFiltersValue,
    ]);

    // ========================================================================
    // DETAIL / HIERARCHY EXPAND (Kendo v15 — detailExpand + onDetailExpandChange)
    // ========================================================================
    const {
        expandField: settingsExpandField,
        onExpandChange: settingsOnExpandChange,
        detail: settingsDetail,
        rowRender: settingsRowRender,
        expandColumn: _settingsExpandColumn,
        expandWhen: settingsExpandWhen,
        cells: settingsCells,
        dataItemKey: settingsDataItemKey,
        ...restSettingsConfig
    } = settingsConfig || {};

    const resolvedDataItemKey = useMemo(
        () =>
            settingsDataItemKey ??
            resolveDataItemKey(settingsConfig, isGroupedVariant ? data : displayData),
        [settingsDataItemKey, settingsConfig, isGroupedVariant, data, displayData],
    );

    const detailExpand = useMemo(() => {
        if (!settingsDetail || !settingsExpandField || !resolvedDataItemKey) return undefined;
        const rows = isGroupedVariant ? groupedFlattenedData : pageUser;
        return buildDetailExpandFromData(rows, resolvedDataItemKey, settingsExpandField);
    }, [
        settingsDetail,
        settingsExpandField,
        resolvedDataItemKey,
        isGroupedVariant,
        groupedFlattenedData,
        pageUser,
    ]);

    const handleDetailExpandChange = useCallback(
        (event) => {
            if (!settingsOnExpandChange || !settingsExpandField || !resolvedDataItemKey) return;

            const nextExpand = event.detailExpand || {};
            const rows = isGroupedVariant ? groupedFlattenedData : pageUser;

            rows.forEach((item) => {
                const key = item?.[resolvedDataItemKey];
                if (key === undefined || key === null) return;

                const keyStr = String(key);
                const wasExpanded = Boolean(item[settingsExpandField]);
                const nowExpanded = Boolean(nextExpand[keyStr] ?? nextExpand[key]);

                if (wasExpanded !== nowExpanded) {
                    settingsOnExpandChange({ ...event, dataItem: item });
                }
            });
        },
        [
            settingsOnExpandChange,
            settingsExpandField,
            resolvedDataItemKey,
            isGroupedVariant,
            groupedFlattenedData,
            pageUser,
        ],
    );

    const hasDetailExpand =
        Boolean(settingsDetail && settingsExpandField && resolvedDataItemKey);

    const detailExpandRows = isGroupedVariant ? groupedFlattenedData : pageUser;

    const expandWhenFn = useMemo(
        () => resolveExpandWhen(settingsExpandWhen, detailExpandRows),
        [settingsExpandWhen, detailExpandRows],
    );

    const gridCells = useMemo(() => {
        if (!settingsDetail || !expandWhenFn) return settingsCells;

        const renderHierarchyDataCell = (cellProps) => {
            if (!expandWhenFn(cellProps?.dataItem)) {
                return (
                    <td
                        className="k-table-td k-hierarchy-cell k-hierarchy-cell-empty"
                        role="gridcell"
                        aria-colindex={cellProps?.ariaColumnIndex}
                    />
                );
            }

            const CustomHierarchyCell = settingsCells?.hierarchy?.data;
            if (CustomHierarchyCell) {
                return <CustomHierarchyCell {...cellProps} cellProps={cellProps} />;
            }

            return <GridHierarchyCell cellProps={cellProps} />;
        };

        return {
            ...settingsCells,
            hierarchy: {
                ...settingsCells?.hierarchy,
                data: renderHierarchyDataCell,
            },
        };
    }, [settingsDetail, expandWhenFn, settingsCells]);

    const loadingSkeletonColumnConfigs = useMemo(() => {
        if (isGroupedVariant) {
            const configs = [...staticColumns];
            for (let i = 0; i < 6; i++) {
                configs.push({ width: '120px' });
            }
            return configs;
        }

        const cols = columnsForRender;
        const resolved = resolveSkeletonColumnConfigs(cols, {
            hierarchyWidth: hasDetailExpand ? '48px' : null,
        });

        if (resolved.length > 0) return resolved;

        if (isGridPending) {
            return resolveSkeletonColumnConfigs(
                buildPendingGridColumns(effectiveSkeletonColumnCount, DEFAULT_PENDING_COLUMN_WIDTH),
            );
        }

        return resolved;
    }, [isGroupedVariant, staticColumns, columnsForRender, hasDetailExpand, isGridPending, effectiveSkeletonColumnCount]);

    const loadingSkeletonColumns = useMemo(
        () => {
            if (loadingSkeletonColumnConfigs.length > 0) return loadingSkeletonColumnConfigs.length;
            return effectiveSkeletonColumnCount;
        },
        [loadingSkeletonColumnConfigs, effectiveSkeletonColumnCount],
    );

    const skeletonRowCount = useMemo(() => {
        if (skeletonRows != null) return skeletonRows;
        if (isGroupedVariant) {
            return groupedEffectiveDataState?.take || INITIAL_CONFIG.take;
        }
        if (autoResizeSize) {
            return pageuserGrid?.take || windowPageSize || INITIAL_CONFIG.take;
        }
        return pageuserGrid?.take || INITIAL_CONFIG.take;
    }, [
        skeletonRows,
        isGroupedVariant,
        groupedEffectiveDataState?.take,
        autoResizeSize,
        pageuserGrid?.take,
        windowPageSize,
    ]);

    // ========================================================================
    // RENDER — GROUPED VARIANT
    // ========================================================================
    if (isGroupedVariant) {
        return (
            <div ref={gridRef} className={wrapperClasses}>
                <Grid
                    data={
                        isLoading
                            ? []
                            : isPageUserEmpty
                                ? []
                                : groupedProcessedData?.data
                    }
                    resizable={flags.resizing}
                    reorderable={flags.reordering}
                    scrollable={isLoading ? effectiveScrollable : scrollable}
                    sortable={!isGridPending && flags.sorting}
                    expandField="expanded"
                    onExpandChange={handleExpandChange}
                    groupable={
                        flags.grouping && !isLoading
                            ? {
                                footer: 'none',
                                header: !hideGroupingHeader,
                            }
                            : false
                    }
                    pageable={false}
                    total={isPageUserEmpty ? 0 : groupedProcessedData.total}
                    {...groupedEffectiveDataState}
                    onDataStateChange={handleGroupedDataStateChange}
                    className={innerGridClasses}
                >
                    {flags.searching && !isLoading && (
                        <GridToolbar>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <Input
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    placeholder="Search..."
                                    style={{ width: '250px' }}
                                />
                            </div>
                        </GridToolbar>
                    )}
                    <GridNoRecords>
                        {isGridPending ? (
                        <GridLoadingSkeletonRow
                            rows={skeletonRowCount}
                            columns={loadingSkeletonColumns}
                            columnConfigs={loadingSkeletonColumnConfigs}
                            hideHeaderRow={staticColumns.length > 0}
                            wrapperClassName=""
                        />
                        ) : (
                            <GridLoadingSkeleton
                                rows={skeletonRowCount}
                                columns={loadingSkeletonColumns}
                                columnConfigs={loadingSkeletonColumnConfigs}
                                showNoData={
                                    !groupedProcessedData?.data ||
                                    groupedProcessedData?.data?.length === 0
                                }
                                isLoading={false}
                                isShowHeader={emptySkeletonSyncHeader}
                                noDataText={noDataText}
                            />
                        )}
                    </GridNoRecords>

                    {/* Static columns */}
                    {staticColumns.map((col, index) => {
                        const defaultDataCell = (props) => {
                            const raw = props?.dataItem?.[col.field];
                            const isNumber =
                                typeof raw === 'number' && Number.isFinite(raw);
                            const value = isNumber ? numberWithCommas(raw) : (raw ?? '');
                            return (
                                <TruncatedCell
                                    value={String(value)}
                                    alignRight={isNumber}
                                    tdProps={props.tdProps}
                                    className={props.className}
                                />
                            );
                        };
                        const dataCell = (props) =>
                            col.cell ? col.cell(props) : defaultDataCell(props);
                        const staticColumnCell = (props) => {
                            if (props.rowType === 'groupHeader') {
                                return <GridGroupCell {...props} />;
                            }
                            if (props.rowType === 'groupFooter') {
                                return (
                                    <td
                                        className={`k-table-td ${GRID_CONFIG.className}-new-group-filler ${props.className || ''}`.trim()}
                                        style={props.style}
                                    />
                                );
                            }
                            return dataCell(props);
                        };
                        return (
                            <Column
                                key={index}
                                field={col.field}
                                title={col.title}
                                width={col.width || '150px'}
                                cell={staticColumnCell}
                                cells={{ data: dataCell }}
                            />
                        );
                    })}

                    {/* Dynamic grouped/simple date columns */}
                    {flags.grouping
                        ? generateGroupedColumns()
                        : generateSimpleDateColumns()}
                </Grid>
                {renderExternalPager()}
            </div>
        );
    }

    // ========================================================================
    // RENDER — DEFAULT / CUSTOM / ADVANCED VARIANTS
    // ========================================================================

    return (
        <div ref={gridRef} className={wrapperClasses}>
            <Grid
                data={gridDisplayData}
                onDataStateChange={dataStateChange}
                sortable={!isGridPending && flags.sorting}
                pageable={false}
                scrollable={effectiveScrollable}
                className={innerGridClasses}
                detail={settingsDetail}
                rowRender={settingsRowRender}
                cells={gridCells}
                dataItemKey={hasDetailExpand ? resolvedDataItemKey : undefined}
                detailExpand={hasDetailExpand ? detailExpand : undefined}
                onDetailExpandChange={
                    hasDetailExpand ? handleDetailExpandChange : undefined
                }
                {...pageuserGrid}
                {...restSettingsConfig}
                {...pagination}
            >
                <GridNoRecords>
                    {isGridPending ? (
                        <GridLoadingSkeletonRow
                            rows={skeletonRowCount}
                            columns={loadingSkeletonColumns}
                            columnConfigs={loadingSkeletonColumnConfigs}
                            isConsumption={isConsumption}
                            hideHeaderRow={columnsForRender.length > 0}
                            wrapperClassName=""
                        />
                    ) : (
                        <GridLoadingSkeleton
                            rows={skeletonRowCount}
                            columns={loadingSkeletonColumns}
                            columnConfigs={loadingSkeletonColumnConfigs}
                            showNoData={isPageUserEmpty}
                            isLoading={false}
                            isConsumption={isConsumption}
                            isShowHeader={emptySkeletonSyncHeader}
                            noDataText={noDataText}
                            noDataShowIcon={noDataShowIcon}
                        />
                    )}
                </GridNoRecords>

                {/* filter Types ["text","numeric","boolean","date"]. */}
                {columnsForRender?.map((col, index) => {
                    const {
                        isTooltip,
                        title: columnTitle,
                        titleLength,
                        cell: _customCell,
                        cells: customCells,
                        headerCell: customHeaderCell,
                        cellStyle: _cellStyle,
                        truncate: _truncate,
                        ...columnWithoutPresentationProps
                    } = col || {};

                    const cellProp = resolveColumnCellRenderer(col);

                    const titleText =
                        typeof columnTitle === 'string' ? columnTitle : '';
                    const isActiveColumn =
                        !isGridPending && isColumnActive(col?.field, pageuserGrid);
                    const mergedHeaderClassName =
                        `${columnWithoutPresentationProps?.headerClassName || ''} ${isActiveColumn ? 'bg-alert' : ''}`.trim();

                    const isPendingSkeletonColumn = String(col?.field ?? '').startsWith('__rs_grid_pending_');
                    const showColumnMenu =
                        !isPendingSkeletonColumn && Boolean(col?.filter && col?.filter !== '');

                    const resolvedHeaderCell = customHeaderCell
                        ? wrapGridHeaderCell(customHeaderCell)
                        : titleText
                            ? buildTruncatedHeaderCell({
                                titleText,
                                titleLength: isTooltip ? titleLength : undefined,
                                isActiveColumn,
                                showColumnMenu,
                            })
                            : undefined;

                    const cellsProp = { ...(customCells || {}) };
                    if (cellProp && !cellsProp.data) {
                        cellsProp.data = cellProp;
                    }
                    if (resolvedHeaderCell) {
                        cellsProp.headerCell = resolvedHeaderCell;
                    }
                    const finalCellsProp =
                        Object.keys(cellsProp).length > 0 ? cellsProp : undefined;

                    const emptyStateColumnWidth =
                        shouldLimitEmptyColumns && columnsForRender.length > 0
                            ? `${(100 / columnsForRender.length).toFixed(4)}%`
                            : undefined;

                    return (
                        <GridColumn
                            key={`${col?.field || index}-${index}`}
                            {...columnWithoutPresentationProps}
                            width={emptyStateColumnWidth ?? columnWithoutPresentationProps?.width}
                            cell={cellProp}
                            cells={finalCellsProp}
                            headerClassName={mergedHeaderClassName}
                            title={titleText}
                            headerCell={resolvedHeaderCell}
                            {...columnProps(col?.field)}
                            columnMenu={
                                showColumnMenu
                                    ? (props) => {
                                        const filtersExcludingCurrent =
                                            pageuserGrid?.filter?.filters?.filter(
                                                (f) =>
                                                    f.filters.some(
                                                        (field) =>
                                                            field?.field !== col.field,
                                                    ),
                                            ) || [];
                                        const modifiedFilterState = {
                                            ...pageuserGrid,
                                            filter:
                                                filtersExcludingCurrent.length > 0
                                                    ? {
                                                        ...pageuserGrid.filter,
                                                        filters: filtersExcludingCurrent,
                                                    }
                                                    : undefined,
                                            take: undefined,
                                        };
                                        const dataForCurrentColumn = process(
                                            filterData,
                                            modifiedFilterState,
                                        );

                                        const filteredDataLengthVal =
                                            _get(settingsConfig, 'total', null) !== null
                                                ? _get(settingsConfig, 'total', 0)
                                                : pageuserGrid?.filter &&
                                                    pageuserGrid.filter.filters &&
                                                    pageuserGrid.filter.filters.length > 0
                                                    ? (() => {
                                                        const processed = process(
                                                            filterData,
                                                            {
                                                                ...pageuserGrid,
                                                                skip: 0,
                                                                take:
                                                                    filterData?.length ||
                                                                    0,
                                                            },
                                                        );
                                                        return processed?.total || 0;
                                                    })()
                                                    : data?.length || 0;

                                        if (col?.filter === 'text') {
                                            return ColumnMenuCheckboxFilter(
                                                props,
                                                dataForCurrentColumn?.data,
                                                filteredDataLengthVal,
                                            );
                                        }
                                        return ColumnMenu(
                                            props,
                                            dataForCurrentColumn?.data,
                                        );
                                    }
                                    : undefined
                            }
                        />
                    );
                })}
            </Grid>
            {renderExternalPager()}
        </div>
    );
};

// ============================================================================
// PropTypes
// ============================================================================

ResKendoGrid.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array,
    settings: PropTypes.object,
    config: PropTypes.object,
    variant: PropTypes.oneOf(['default', 'custom', 'advanced', 'grouped']),
    features: PropTypes.object,
    pageable: PropTypes.bool,
    sortable: PropTypes.bool,
    filterable: PropTypes.bool,
    groupable: PropTypes.bool,
    resizable: PropTypes.bool,
    reorderable: PropTypes.bool,
    selectable: PropTypes.bool,
    searchable: PropTypes.bool,
    isDataStateRequired: PropTypes.bool,
    onDataStateChange: PropTypes.func,
    dataState: PropTypes.object,
    initialDataState: PropTypes.object,
    initialFilter: PropTypes.object,
    scrollable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    isLoading: PropTypes.bool,
    hasLoaded: PropTypes.bool,
    loadResetKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    noDataText: PropTypes.node,
    noDataShowIcon: PropTypes.bool,
    noBoxShadow: PropTypes.bool,
    isListTable: PropTypes.bool,
    isConsumption: PropTypes.bool,
    customSettingsClassName: PropTypes.string,
    isCustomClass: PropTypes.string,
    skeletonColumns: PropTypes.number,
    skeletonRows: PropTypes.number,
    hidePaginationInfo: PropTypes.bool,
    hideFirstLastNav: PropTypes.bool,
    pageSizes: PropTypes.array,
    autoResizeSize: PropTypes.bool,
    callbackFilterChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    change: PropTypes.func,
    flag: PropTypes.bool,
    pagerChange: PropTypes.bool,
    isScrollTop: PropTypes.bool,
    isFullData: PropTypes.bool,
    staticColumns: PropTypes.array,
    groupedColumns: PropTypes.array,
    selectedChannel: PropTypes.string,
    hideGroupingHeader: PropTypes.bool,
    showHeader: PropTypes.bool,
};

ResKendoGrid.displayName = GRID_CONFIG.componentName;

export default memo(ResKendoGrid);
