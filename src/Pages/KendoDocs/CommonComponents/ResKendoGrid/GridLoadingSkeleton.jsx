/**
 * ResKendoGrid - GridLoadingSkeleton
 *
 * Skeleton loading state for empty/loading grid with "no data" messaging.
 * Ported from RSCustomKendoGrid/GridLoadingSkeleton.jsx
 */
import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { NO_DATA_AVAILABEL } from 'Constants/GlobalConstant/Placeholders';
import {
    GRID_SKELETON_BODY_HEIGHT,
    GRID_SKELETON_BORDER,
    GRID_SKELETON_CELL_INNER_RADIUS,
    GRID_SKELETON_HEADER_BG,
    GRID_SKELETON_HEADER_HEIGHT,
    GRID_SKELETON_TABLE_RADIUS,
    GRID_SKELETON_TABLE_SHADOW,
    gridLoadingSkeletonCriticalCss,
} from './gridLoadingSkeletonCriticalCss';
import { useGridHeaderColumnWidths, useGridHeaderBodyScrollSync } from './hooks';
import {
    buildPixelSyncedColumnWidths,
    resolveHeaderSyncedTableWidth,
    resolveSkeletonColumnConfigs,
    resolveSyncedSkeletonColumnWidth,
} from './utils';

const GridLoadingSkeleton = ({
    rows = 5,
    columns = 6,
    showNoData,
    isLoading = true,
    isConsumption = false,
    columnConfigs = [],
    isShowHeader = false,
    noDataText = '',
    noDataShowIcon = true,
    wrapperClassName = '',
    hideLeftBorder = false,
    injectCriticalCss = true,
    bodyRowHeight = GRID_SKELETON_BODY_HEIGHT,
}) => {
    const normalizeWidthValue = useCallback((width, fallback = 150) => {
        if (typeof width === 'number' && !Number.isNaN(width)) {
            return width;
        }
        if (typeof width === 'string') {
            const numericPart = parseFloat(width);
            if (!Number.isNaN(numericPart)) {
                return numericPart;
            }
        }
        return fallback;
    }, []);

    const resolvedColumnConfigs = useMemo(
        () => resolveSkeletonColumnConfigs(columnConfigs),
        [columnConfigs],
    );

    const actualColumns =
        isShowHeader && resolvedColumnConfigs?.length > 0
            ? resolvedColumnConfigs.length
            : columns;

    const calculateTotalWidth = () => {
        if (!columnConfigs || columnConfigs.length === 0) {
            return null;
        }
        return columnConfigs.reduce((sum, col) => sum + normalizeWidthValue(col?.width), 0);
    };

    const calculateMaxWidth = () => {
        if (!isConsumption || !columnConfigs || columnConfigs.length === 0) {
            return '100%';
        }
        const totalWidth = calculateTotalWidth();
        switch (true) {
            case totalWidth > 7800:
                return '16%';
            case totalWidth > 7500:
                return '17%';
            case totalWidth > 6500:
                return '19%';
            case totalWidth > 6300:
                return '20%';
            case totalWidth > 6000:
                return '21%';
            case totalWidth > 3500:
                return '34%';
            case totalWidth > 3000:
                return '40%';
            case totalWidth > 2000:
                return '48%';
            default:
                return '100%';
        }
    };

    const wrapperClass = wrapperClassName ?? 'm-15';

    const { containerRef, headerWidths, headerTableWidth } = useGridHeaderColumnWidths(
        isShowHeader,
        [actualColumns, resolvedColumnConfigs, isConsumption],
    );

    const headerColumnCount = headerWidths?.length ?? 0;
    const canSyncToHeader = isShowHeader && headerColumnCount > 0;
    const syncedColCount = canSyncToHeader ? headerColumnCount : actualColumns;
    const isEmptyState = showNoData && !isLoading;
    const syncToVisibleHeader = canSyncToHeader;

    const syncedPixelWidths = useMemo(() => {
        if (!syncToVisibleHeader) return null;
        return buildPixelSyncedColumnWidths(headerWidths, headerTableWidth);
    }, [syncToVisibleHeader, headerWidths, headerTableWidth]);

    const resolvedTableWidthPx = useMemo(() => {
        if (!syncToVisibleHeader) return 0;
        return resolveHeaderSyncedTableWidth(headerWidths, headerTableWidth);
    }, [syncToVisibleHeader, headerWidths, headerTableWidth]);

    useGridHeaderBodyScrollSync(syncToVisibleHeader, containerRef, [
        headerWidths,
        resolvedTableWidthPx,
    ]);

    const getEqualColumnWidth = (index) => {
        // When real Kendo headers are visible, use measured widths — not equal slices.
        if (syncToVisibleHeader) return null;
        if (!isEmptyState || syncedColCount <= 0) return null;
        if (index >= syncedColCount) return null;
        return `${(100 / syncedColCount).toFixed(4)}%`;
    };

    const getSyncedColumnWidth = (index) => {
        const equalWidth = getEqualColumnWidth(index);
        if (equalWidth) return equalWidth;

        return resolveSyncedSkeletonColumnWidth({
            index,
            headerWidths,
            headerTableWidth,
            syncToHeader: isShowHeader,
            columnConfigs: resolvedColumnConfigs,
            columnCount: syncedColCount,
            syncedPixelWidths,
        });
    };

    const getCellWidthStyle = (columnWidth, index) => {
        if (!columnWidth) {
            if (isEmptyState) {
                const equalWidth = getEqualColumnWidth(index);
                return equalWidth
                    ? { width: equalWidth, minWidth: 0, maxWidth: equalWidth }
                    : { minWidth: 0 };
            }
            return {
                minWidth: '100px',
                maxWidth: isConsumption ? `${100 / actualColumns}%` : '',
            };
        }

        return {
            width: columnWidth,
            minWidth: columnWidth,
            maxWidth: columnWidth,
        };
    };

    const getBlueHeaderCellStyle = (index, columnWidth) => ({
        ...getCellWidthStyle(columnWidth, index),
        height: GRID_SKELETON_HEADER_HEIGHT,
        boxSizing: 'border-box',
        background: GRID_SKELETON_HEADER_BG,
        backgroundColor: GRID_SKELETON_HEADER_BG,
        backgroundImage: 'none',
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        ...(index < syncedColCount - 1 && { borderRight: `1px solid ${GRID_SKELETON_BORDER}` }),
        ...(index === syncedColCount - 1 && { borderRight: 0 }),
        ...(index === 0 && { borderTopLeftRadius: GRID_SKELETON_CELL_INNER_RADIUS }),
        ...(index === syncedColCount - 1 && { borderTopRightRadius: GRID_SKELETON_CELL_INNER_RADIUS }),
    });

    const getBodyCellStyle = (rowIndex, colIndex, columnWidth) => ({
        ...getCellWidthStyle(columnWidth, colIndex),
        height: bodyRowHeight,
        boxSizing: 'border-box',
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        ...(colIndex < syncedColCount - 1 && { borderRight: `1px solid ${GRID_SKELETON_BORDER}` }),
        ...(colIndex === syncedColCount - 1 && { borderRight: 0 }),
        ...(rowIndex === rows - 1 && colIndex === 0 && { borderBottomLeftRadius: GRID_SKELETON_CELL_INNER_RADIUS }),
        ...(rowIndex === rows - 1 && colIndex === syncedColCount - 1 && { borderBottomRightRadius: GRID_SKELETON_CELL_INNER_RADIUS }),
    });

    const syncedTableWidth = useMemo(() => {
        if (syncToVisibleHeader && resolvedTableWidthPx > 0) return `${resolvedTableWidthPx}px`;
        if (isShowHeader) return '100%';
        if (isConsumption) return `${calculateTotalWidth()}px`;
        return '100%';
    }, [syncToVisibleHeader, resolvedTableWidthPx, isShowHeader, isConsumption, calculateTotalWidth]);

    const rootClassName = [
        'rs-grid-loading-skeleton',
        wrapperClass,
        !isLoading ? 'no-animation grid-empty-skeleton' : '',
        isLoading && isConsumption ? 'rs-grid-loading-skeleton--loading' : '',
        isEmptyState && !isShowHeader ? 'grid-empty-fit' : '',
        isShowHeader ? 'skeleton-body-only' : '',
        isConsumption ? 'consumption-skeleton' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            ref={containerRef}
            className={rootClassName}
            style={
                syncToVisibleHeader && resolvedTableWidthPx > 0
                    ? { width: `${resolvedTableWidthPx}px`, minWidth: `${resolvedTableWidthPx}px` }
                    : undefined
            }
        >
            {injectCriticalCss ? <style>{gridLoadingSkeletonCriticalCss}</style> : null}
            {showNoData && (
                <NoDataAvailableRender
                    className="nodata-skeleton-con"
                    message={noDataText || NO_DATA_AVAILABEL}
                    isShowIcon={noDataShowIcon}
                />
            )}
            <table
                className="k-grid-table k-table"
                style={{
                    width: isShowHeader ? syncedTableWidth : isConsumption ? syncedTableWidth : '100%',
                    minWidth:
                        syncToVisibleHeader && resolvedTableWidthPx > 0
                            ? `${resolvedTableWidthPx}px`
                            : isEmptyState && !isShowHeader
                              ? 0
                              : isShowHeader
                                ? '100%'
                                : undefined,
                    maxWidth: isEmptyState && !isShowHeader ? '100%' : isShowHeader ? 'none' : calculateMaxWidth(),
                    tableLayout: syncToVisibleHeader ? 'fixed' : undefined,
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    ...(isShowHeader
                        ? { border: 0 }
                        : {
                              padding: '5px',
                              borderRadius: GRID_SKELETON_TABLE_RADIUS,
                              boxShadow: GRID_SKELETON_TABLE_SHADOW,
                              overflow: 'hidden',
                              backgroundColor: '#ffffff',
                          }),
                }}
            >
                <colgroup>
                    {Array.from({ length: syncedColCount }).map((_, idx) => {
                        const columnWidth = getSyncedColumnWidth(idx);
                        return (
                            <col
                                key={idx}
                                style={columnWidth ? { width: columnWidth } : undefined}
                            />
                        );
                    })}
                </colgroup>
                <tbody className="k-table-tbody">
                    <tr
                        className={`k-table-row skeleton-blue-row ${isShowHeader ? 'hide' : ''}`}
                        style={{ height: GRID_SKELETON_HEADER_HEIGHT }}
                    >
                        {Array.from({ length: syncedColCount }).map((_, idx) => {
                            const columnWidth = getSyncedColumnWidth(idx);
                            return (
                                <td
                                    key={idx}
                                    className={`k-table-td skeleton-blue-cell ${!isLoading ? 'no-animation' : ''}`}
                                    style={getBlueHeaderCellStyle(idx, columnWidth)}
                                >
                                    &nbsp;
                                </td>
                            );
                        })}
                    </tr>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`k-table-row skeleton-row ${rowIndex % 2 === 1 ? 'k-table-alt-row' : ''}`}
                            style={{ height: bodyRowHeight }}
                        >
                            {Array.from({ length: syncedColCount }).map((_, colIdx) => {
                                const columnWidth = getSyncedColumnWidth(colIdx);
                                return (
                                    <td
                                        key={colIdx}
                                        className={`k-table-td skeleton-cell ${!isLoading ? 'no-animation' : ''}`}
                                        style={getBodyCellStyle(rowIndex, colIdx, columnWidth)}
                                    >
                                        &nbsp;
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

GridLoadingSkeleton.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    showNoData: PropTypes.bool,
    isLoading: PropTypes.bool,
    isConsumption: PropTypes.bool,
    columnConfigs: PropTypes.array,
    isShowHeader: PropTypes.bool,
    noDataText: PropTypes.node,
    noDataShowIcon: PropTypes.bool,
    wrapperClassName: PropTypes.string,
    hideLeftBorder: PropTypes.bool,
    injectCriticalCss: PropTypes.bool,
    bodyRowHeight: PropTypes.number,
};

export default GridLoadingSkeleton;
