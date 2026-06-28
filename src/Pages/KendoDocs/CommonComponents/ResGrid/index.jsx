/**
 * ResGrid - Reusable Kendo Grid wrapper for listing screens.
 *
 * Supports two layouts:
 * - "table": traditional tabular grid with headers, sorting, filtering
 * - "list": card-based listing (Communication/Analytics style) — consumer passes cell renderer
 *
 * @example Table layout
 * <ResGrid data={rows} columns={columns} sortable pageable loading={isLoading} />
 *
 * @example List layout (Communication Analytics)
 * <ResGrid
 *     layout="list"
 *     listPreset="analytics"
 *     data={analyticsListData}
 *     columns={[{ cell: (props) => <AnalyticsList {...props} listLayout={props.listLayout} /> }]}
 *     detail={(props) => <AnalyticsListDetail {...props} listLayout={props.listLayout} />}
 *     expandField="expanded"
 *     onExpandChange={handleExpandChange}
 *     pageable
 *     total={totalCampaigns}
 *     dataState={pageInitialValue}
 *     onDataStateChange={handlePageChange}
 *     isServerSide
 * />
 */
import { memo, useState, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Grid, GridColumn, GridNoRecords } from '@progress/kendo-react-grid';
import {
    GRID_CONFIG,
    gridClass,
    layoutClass,
    LAYOUT_CLASSES,
    PAGER_CONFIG,
    INITIAL_GRID_STATE,
    SCROLL_MODES,
    resolveListLayoutConfig,
    resolveSkeletonListVariant,
} from './config';
import { ColumnMenu, ColumnMenuCheckboxFilter, isColumnActive } from './constants';
import TruncateCell from './TruncateCell';
import GridSkeleton from './GridSkeleton';
import GridToolbar from './GridToolbar';
import ResNoDataAvailable from '../ResNoDataAvailable';
import {
    processGridData,
    buildDetailExpandFromData,
    resolveExportFormats,
    exportToCsv,
    exportToExcel,
    detectChangeType,
} from './utils';
import { useIconReplacements, useHideFirstLastNav, useFilterPopupClasses } from './hooks';
import ResPager from 'CommonComponents/ResPager';
import './resgrid.scss';

const ResGrid = ({
    data = [],
    columns = [],
    loading = false,
    error = false,
    skeletonRows = 5,
    emptyMessage,
    emptyContent,
    emptyShowIcon = true,
    sortable = true,
    filterable = false,
    pageable = true,
    selectable = false,
    resizable = false,
    reorderable = false,
    scrollable = 'none',
    stickyHeader = false,
    layout = 'table',
    listPreset,
    listConfig,
    skeletonVariant,
    total: totalProp,
    dataState: controlledDataState,
    onDataStateChange,
    isServerSide = false,
    exportable = false,
    onExport,
    toolbar,
    wrapperClassName = '',
    className = '',
    noBoxShadow = false,
    pageSizes: customPageSizes,
    hidePaginationInfo = false,
    hideFirstLastNav = false,
    detail,
    expandField,
    onExpandChange,
    dataItemKey,
    initialDataState,
    groupable = false,
    ...rest
}) => {
    const gridRef = useRef(null);

    const [internalDataState, setInternalDataState] = useState(() => ({
        ...INITIAL_GRID_STATE,
        ...(initialDataState && typeof initialDataState === 'object' ? initialDataState : {}),
    }));

    const isControlled = controlledDataState !== undefined;
    const dataState = isControlled ? controlledDataState : internalDataState;

    const exportFormats = useMemo(() => resolveExportFormats(exportable), [exportable]);

    const shouldClientProcess = !isServerSide && !isControlled;

    const processed = useMemo(() => {
        if (!shouldClientProcess) {
            return { data: data || [], total: totalProp ?? data?.length ?? 0 };
        }
        return processGridData(data, dataState, false);
    }, [data, dataState, shouldClientProcess, totalProp]);

    const displayData = processed.data;
    const displayTotal = isServerSide ? (totalProp ?? data?.length ?? 0) : processed.total;

    const isEmpty = !loading && !error && (!displayData || displayData.length === 0);
    const showListLayout = layout === 'list';

    const resolvedSkeletonVariant = useMemo(
        () => resolveSkeletonListVariant({ skeletonVariant, listPreset, listConfig }),
        [skeletonVariant, listPreset, listConfig],
    );

    const listLayoutSettings = useMemo(
        () => (showListLayout ? resolveListLayoutConfig(listPreset, listConfig) : null),
        [showListLayout, listPreset, listConfig],
    );

    const listLayoutStyle = useMemo(() => {
        if (!listLayoutSettings) return undefined;

        const columnWidths = listLayoutSettings.detailColumnWidths || {};
        const channelWidth = columnWidths.channel ?? 112;
        const statusWidth = columnWidths.status ?? 72;

        return {
            '--resgrid-list-row-gap': `${listLayoutSettings.rowGap}px`,
            '--resgrid-detail-overlap': `${listLayoutSettings.detailOverlap}px`,
            '--resgrid-col-channel-width': `${channelWidth}px`,
            '--resgrid-col-status-width': `${statusWidth}px`,
        };
    }, [listLayoutSettings]);

    const resolvedDataItemKey = dataItemKey ?? (detail && expandField ? 'id' : undefined);

    const detailExpand = useMemo(
        () =>
            detail && expandField && resolvedDataItemKey
                ? buildDetailExpandFromData(displayData, resolvedDataItemKey, expandField)
                : undefined,
        [detail, expandField, resolvedDataItemKey, displayData],
    );

    const handleRowToggleExpand = useCallback(
        (rowDataItem) => {
            if (!onExpandChange || !rowDataItem) return;
            // Pass row as-is — consumers (e.g. analytics) read expanded and toggle themselves
            onExpandChange({ dataItem: rowDataItem });
        },
        [onExpandChange],
    );

    const resolvedDetail = useMemo(() => {
        if (!detail) return undefined;
        if (!showListLayout || !listLayoutSettings) return detail;

        if (typeof detail === 'function') {
            return (props) => detail({ ...props, listLayout: listLayoutSettings });
        }

        const DetailComponent = detail;
        return (props) => <DetailComponent {...props} listLayout={listLayoutSettings} />;
    }, [detail, showListLayout, listLayoutSettings]);

    const handleDetailExpandChange = useCallback(
        (event) => {
            if (!onExpandChange || !expandField || !resolvedDataItemKey) return;

            const nextExpand = event.detailExpand || {};

            displayData.forEach((item) => {
                const key = item?.[resolvedDataItemKey];
                if (key === undefined || key === null) return;

                const keyStr = String(key);
                const wasExpanded = Boolean(item[expandField]);
                const nowExpanded = Boolean(nextExpand[keyStr] ?? nextExpand[key]);

                if (wasExpanded !== nowExpanded) {
                    onExpandChange({ ...event, dataItem: item });
                }
            });
        },
        [onExpandChange, expandField, resolvedDataItemKey, displayData],
    );

    // Clean state to spread onto <Grid> — omit empty group/filter that can trigger
    // unwanted group-row layout or break list rendering.
    const gridStateProps = useMemo(() => {
        const next = {
            skip: dataState?.skip ?? 0,
            take: dataState?.take ?? INITIAL_GRID_STATE.take,
        };
        if (dataState?.sort?.length) next.sort = dataState.sort;
        if (dataState?.filter) next.filter = dataState.filter;
        if (dataState?.group?.length) next.group = dataState.group;
        return next;
    }, [dataState]);

    const handleDataStateChange = useCallback(
        async (event) => {
            const nextState = event.dataState;

            if (isServerSide || isControlled) {
                if (!isControlled) {
                    setInternalDataState(nextState);
                }
                await onDataStateChange?.(event);
                return;
            }

            const { filteringChanged, sortingChanged } = detectChangeType(dataState, nextState);

            if (filteringChanged || sortingChanged) {
                const nextWithReset = { ...nextState, skip: 0 };
                setInternalDataState(nextWithReset);
                onDataStateChange?.({ ...event, dataState: nextWithReset });
                return;
            }

            setInternalDataState(nextState);
            onDataStateChange?.(event);
        },
        [dataState, isServerSide, isControlled, onDataStateChange],
    );

    const pageableSettings = useMemo(() => {
        if (!pageable || loading || isEmpty) return false;
        if (typeof pageable === 'object') {
            return {
                ...PAGER_CONFIG,
                ...pageable,
                pageSizes: pageable.pageSizes || customPageSizes || PAGER_CONFIG.pageSizes,
                info: pageable.info ?? !hidePaginationInfo,
            };
        }
        if (displayTotal <= (dataState?.take || 5)) return false;

        return {
            ...PAGER_CONFIG,
            pageSizes: customPageSizes || PAGER_CONFIG.pageSizes,
            info: !hidePaginationInfo,
        };
    }, [
        pageable,
        loading,
        isEmpty,
        displayTotal,
        dataState?.take,
        customPageSizes,
        hidePaginationInfo,
    ]);

    const showExternalPager = Boolean(pageableSettings);

    const pagerConfig = useMemo(() => {
        if (!showExternalPager) return null;
        return {
            skip: dataState?.skip ?? 0,
            take: dataState?.take ?? INITIAL_GRID_STATE.take,
            info: pageableSettings.info,
            pageSizes: pageableSettings.pageSizes,
            previousNext: pageableSettings.previousNext ?? true,
            buttonCount: pageableSettings.buttonCount ?? 4,
            responsive: pageableSettings.responsive ?? true,
            type: pageableSettings.type,
        };
    }, [showExternalPager, dataState, pageableSettings]);

    const pagerClassName = useMemo(() => {
        if (!showExternalPager) return '';
        return pageableSettings.className || PAGER_CONFIG.className || '';
    }, [showExternalPager, pageableSettings]);

    const handlePagerChange = useCallback(
        ({ skip, take }) => {
            handleDataStateChange({
                dataState: {
                    ...dataState,
                    skip,
                    take,
                },
            });
        },
        [handleDataStateChange, dataState],
    );

    const scrollClass =
        scrollable === 'virtual'
            ? SCROLL_MODES.virtual
            : scrollable === 'scrollable' || scrollable === true
              ? SCROLL_MODES.scrollable
              : SCROLL_MODES.none;

    const wrapperClasses = useMemo(
        () =>
            [
                LAYOUT_CLASSES.base,                                              // 'resgrid' — root scope for all CSS
                showListLayout ? LAYOUT_CLASSES.listWrapper : LAYOUT_CLASSES.tableWrapper,
                showListLayout &&
                    listLayoutSettings?.variant &&
                    `${layoutClass('listing')}--${listLayoutSettings.variant}`,
                showListLayout && listLayoutSettings?.wrapperPlatformClass,
                wrapperClassName,
                loading && 'grid-loading-state',
            ]
                .filter(Boolean)
                .join(' '),
        [showListLayout, listLayoutSettings, wrapperClassName, loading],
    );

    const innerGridClasses = useMemo(() => {
        if (showListLayout) {
            return [scrollClass, 'no-box-shadow', className]
                .filter(Boolean)
                .join(' ');
        }

        return [
            scrollClass,
            noBoxShadow && 'no-box-shadow',
            (loading || isEmpty) && 'hide-grid-header',
            isEmpty && 'noDataAvailable',
            className,
        ]
            .filter(Boolean)
            .join(' ');
    }, [showListLayout, scrollClass, noBoxShadow, loading, isEmpty, className]);

    const handleExportCsv = useCallback(() => {
        exportToCsv(displayData, columns);
        onExport?.('csv', displayData);
    }, [displayData, columns, onExport]);

    const handleExportExcel = useCallback(() => {
        exportToExcel(displayData, columns);
        onExport?.('excel', displayData);
    }, [displayData, columns, onExport]);

    const handleExportPdf = useCallback(() => {
        onExport?.('pdf', displayData);
    }, [displayData, onExport]);

    useIconReplacements(gridRef, [displayData, loading, dataState]);
    useHideFirstLastNav(hideFirstLastNav, gridRef, [displayData, loading]);
    useFilterPopupClasses();

    const renderEmptyOverlay = () => {
        const content = emptyContent ?? (
            <ResNoDataAvailable
                message={emptyMessage ?? GRID_CONFIG.defaultEmptyMessage}
                isShowIcon={emptyShowIcon}
            />
        );
        // Always position the message as a single centred overlay over the skeleton stack.
        // Without this wrapper every skeleton row would show its own empty-state element.
        return (
            <div className={gridClass('empty-overlay')} role="status" aria-live="polite">
                {content}
            </div>
        );
    };

    const renderNoRecords = () => {
        if (loading) {
            return (
                <GridSkeleton
                    rows={skeletonRows}
                    layout={showListLayout ? 'list' : layout}
                    listVariant={resolvedSkeletonVariant}
                    columns={columns?.length || 5}
                    columnConfigs={columns}
                    animated
                    showHeader={!showListLayout && layout === 'table' && columns?.length > 0}
                />
            );
        }

        if (isEmpty) {
            return (
                <div style={{ position: 'relative' }}>
                    <GridSkeleton
                        rows={skeletonRows}
                        columns={columns?.length || 1}
                        columnConfigs={columns}
                        layout={layout}
                        listVariant={resolvedSkeletonVariant}
                        animated={false}
                        showHeader={false}
                    />
                    {renderEmptyOverlay()}
                </div>
            );
        }

        return null;
    };

    const renderColumns = () =>
        columns?.map((col, index) => {
            const {
                truncate,
                title: columnTitle,
                cell: customCell,
                headerCell,
                filter: colFilter,
                ...columnRest
            } = col || {};

            // List layout: render a bare column with the custom cell.
            // Kendo v15 uses the `cells={{ data }}` API (the old `cell` prop is removed from
            // GridColumnProps). We pass both for backward compatibility.
            if (showListLayout) {
                const listCellRenderer = customCell
                    ? (props) =>
                          customCell({
                              ...props,
                              listLayout: listLayoutSettings,
                              onToggleExpand: expandField ? handleRowToggleExpand : undefined,
                          })
                    : undefined;

                return (
                    <GridColumn
                        key={`list-col-${index}`}
                        {...columnRest}
                        cell={listCellRenderer}
                        cells={listCellRenderer ? { data: listCellRenderer } : undefined}
                        title=""
                    />
                );
            }

            const columnField = columnRest.field || `resGridCol${index}`;

            const shouldTruncate = truncate === true;
            const cellProp =
                customCell ||
                (shouldTruncate
                    ? (props) => (
                          <TruncateCell
                              value={props?.dataItem?.[props.field]}
                              tdProps={props.tdProps}
                              className={props.className}
                              alignRight={col.align === 'right'}
                          />
                      )
                    : col.field
                      ? (props) => (
                            <td {...props.tdProps} className={props.className}>
                                {props?.dataItem?.[props.field] ?? 'N/A'}
                            </td>
                        )
                      : undefined);

            const titleText = typeof columnTitle === 'string' ? columnTitle : '';
            const isActiveColumn = isColumnActive(col?.field, dataState);
            const mergedHeaderClassName =
                `${columnRest?.headerClassName || ''} ${isActiveColumn ? 'bg-alert' : ''}`.trim();

            return (
                <GridColumn
                    key={`${columnField}-${index}`}
                    cell={cellProp}
                    cells={cellProp ? { data: cellProp } : undefined}
                    headerCell={headerCell}
                    {...columnRest}
                    field={columnField}
                    title={titleText}
                    width={columnRest.width}
                    headerClassName={mergedHeaderClassName}
                    columnMenu={
                        filterable && colFilter
                            ? (props) => {
                                  if (colFilter === 'text') {
                                      return ColumnMenuCheckboxFilter(props, data);
                                  }
                                  return ColumnMenu(props);
                              }
                            : undefined
                    }
                />
            );
        });

    if (error && !loading) {
        const errorMessage = typeof error === 'string' ? error : 'Unable to load data. Please try again.';
        return (
            <div ref={gridRef} className={`${wrapperClasses} ${gridClass('error')}`} role="alert">
                {errorMessage}
            </div>
        );
    }

    if (loading && showListLayout) {
        return (
            <div ref={gridRef} className={wrapperClasses} style={listLayoutStyle}>
                <GridSkeleton
                    rows={skeletonRows}
                    layout="list"
                    listVariant={resolvedSkeletonVariant}
                    animated
                    showHeader={false}
                />
            </div>
        );
    }

    if (loading && (!displayData || displayData.length === 0)) {
        return (
            <div ref={gridRef} className={wrapperClasses}>
                <GridSkeleton
                    rows={skeletonRows}
                    columns={columns?.length || 5}
                    columnConfigs={columns}
                    layout={layout}
                    listVariant={resolvedSkeletonVariant}
                    showHeader={layout === 'table' && columns?.length > 0}
                />
            </div>
        );
    }

    if (isEmpty && showListLayout) {
        return (
            <div ref={gridRef} className={wrapperClasses} style={listLayoutStyle}>
                <div style={{ position: 'relative' }}>
                    <GridSkeleton
                        rows={skeletonRows}
                        layout="list"
                        listVariant={resolvedSkeletonVariant}
                        animated={false}
                        showHeader={false}
                    />
                    {renderEmptyOverlay()}
                </div>
            </div>
        );
    }

    return (
        <div ref={gridRef} className={wrapperClasses} style={listLayoutStyle}>
            {(toolbar || exportable) && (
                <GridToolbar
                    exportFormats={exportFormats}
                    onExportCsv={handleExportCsv}
                    onExportExcel={handleExportExcel}
                    onExportPdf={handleExportPdf}
                >
                    {toolbar}
                </GridToolbar>
            )}

            <Grid
                data={loading ? [] : displayData}
                total={displayTotal}
                {...gridStateProps}
                onDataStateChange={handleDataStateChange}
                sortable={!loading && !showListLayout && sortable}
                filterable={!loading && filterable}
                pageable={false}
                selectable={selectable}
                resizable={resizable}
                reorderable={reorderable}
                scrollable={scrollable === 'virtual' ? 'virtual' : scrollable === 'scrollable' ? 'scrollable' : 'none'}
                groupable={groupable}
                className={innerGridClasses}
                detail={resolvedDetail}
                dataItemKey={resolvedDataItemKey}
                detailExpand={detailExpand}
                onDetailExpandChange={detailExpand ? handleDetailExpandChange : undefined}
                {...rest}
            >
                <GridNoRecords>{renderNoRecords()}</GridNoRecords>

                {columns?.length > 0 ? renderColumns() : null}
            </Grid>

            {showExternalPager && pagerConfig && (
                <div className={layoutClass('pager')}>
                    <ResPager
                        isServerSide
                        total={displayTotal}
                        config={pagerConfig}
                        onPageChange={handlePagerChange}
                        className={pagerClassName}
                    />
                </div>
            )}
        </div>
    );
};

ResGrid.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array,
    loading: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    skeletonRows: PropTypes.number,
    emptyMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    emptyContent: PropTypes.node,
    emptyShowIcon: PropTypes.bool,
    sortable: PropTypes.bool,
    filterable: PropTypes.bool,
    pageable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    selectable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    resizable: PropTypes.bool,
    reorderable: PropTypes.bool,
    scrollable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    stickyHeader: PropTypes.bool,
    layout: PropTypes.oneOf(['table', 'list']),
    listPreset: PropTypes.oneOf(['analytics', 'communication', 'platform', 'app', 'brand', 'default']),
    listConfig: PropTypes.shape({
        variant: PropTypes.string,
        rowGap: PropTypes.number,
        detailOverlap: PropTypes.number,
        cardClassNames: PropTypes.string,
        detailViewClassNames: PropTypes.string,
        detailTableClassNames: PropTypes.string,
        wrapperPlatformClass: PropTypes.string,
        statusClassMap: PropTypes.object,
        skeletonVariant: PropTypes.oneOf(['communication', 'analytics', 'app', 'brand']),
    }),
    total: PropTypes.number,
    dataState: PropTypes.object,
    onDataStateChange: PropTypes.func,
    isServerSide: PropTypes.bool,
    exportable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    onExport: PropTypes.func,
    toolbar: PropTypes.node,
    wrapperClassName: PropTypes.string,
    className: PropTypes.string,
    noBoxShadow: PropTypes.bool,
    pageSizes: PropTypes.array,
    hidePaginationInfo: PropTypes.bool,
    hideFirstLastNav: PropTypes.bool,
    detail: PropTypes.oneOfType([PropTypes.func, PropTypes.elementType]),
    expandField: PropTypes.string,
    onExpandChange: PropTypes.func,
    dataItemKey: PropTypes.string,
    initialDataState: PropTypes.object,
    groupable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
};

ResGrid.displayName = GRID_CONFIG.componentName;

export {
    resolveListLayoutConfig,
    LIST_LAYOUT_PRESETS,
    LIST_LAYOUT_DEFAULTS,
    LIST_STATUS_CLASS_MAP,
    LIST_STATUS_DEFAULT_CLASS,
    LIST_DETAIL_COLUMN_WIDTHS,
    LIST_DETAIL_EMPTY_MESSAGES,
    CHANNEL_COLORS,
    COMMUNICATION_STATUS_COLORS,
} from './config';
export {
    RESGRID_DEMO_DEFAULTS,
    COMM_ROWS,
    ANALYTICS_ROWS,
    APP_ROWS,
    BRAND_ROWS,
    COMM_CONFIG,
    ANALYTICS_CONFIG,
    APP_CONFIG,
    BRAND_CONFIG,
    buildListColumns,
    COMMUNICATION_STATUS_DEMO_LABELS,
} from './ResGridDocsPreview.constants';
export { default as ResGridDocsPreview } from './ResGridDocsPreview';
export { resolveListStatusClass } from './utils';
export { default as ListEntityImage } from './ListEntityImage';
export { BRAND_SHOP_IMAGE_PLACEHOLDER } from './config';
export {
    CH,
    getChannelId,
    buildResGridChannelRow,
    RESGRID_CHANNELS_LIST,
    EMPTY_CHANNEL_LOOKUP,
} from './channelConstants';
export { default as ResListCard } from './ResListCard/index';
export { default as ResListCardPreview } from './ResListCard/ResListCardPreview';
export {
    ListDetailSkeletonRows,
    ListDetailEmptyRow,
    ListDetailEmptyOverlay,
    CommunicationListDetailSkeletonRows,
    AnalyticsListDetailSkeletonRows,
    CommunicationListDetailEmptyRow,
    AnalyticsListDetailEmptyRow,
    CommunicationListDetailEmptyOverlay,
    AnalyticsListDetailEmptyOverlay,
    getCommunicationDetailColCount,
    getAnalyticsDetailColCount,
} from './ListDetailSkeleton';
export { default as ResPager } from 'CommonComponents/ResPager';
export default memo(ResGrid);
