/**
 * ResKendoGrid - GridLoadingSkeletonRow
 *
 * Full-width table skeleton for grid loading. When hideHeaderRow is true the
 * real Kendo column header stays visible and only body placeholders render.
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';

import { gridLoadingSkeletonCriticalCss } from './gridLoadingSkeletonCriticalCss';
import { useGridHeaderColumnWidths, useGridHeaderBodyScrollSync } from './hooks';
import {
    buildPixelSyncedColumnWidths,
    resolveHeaderSyncedTableWidth,
    resolveSkeletonColumnConfigs,
    resolveSyncedSkeletonColumnWidth,
    sumMeasuredPixelWidths,
    parseSkeletonWidth,
} from './utils';

const GridLoadingSkeletonRow = ({
    rows = 5,
    columns = 5,
    columnConfigs = [],
    isConsumption = false,
    wrapperClassName,
    hideHeaderRow = false,
    isError = true,
    injectCriticalCss = true,
}) => {
    const resolvedConfigs = resolveSkeletonColumnConfigs(columnConfigs);
    const colCount = resolvedConfigs.length > 0 ? resolvedConfigs.length : columns;
    const wrapperClass = wrapperClassName ?? (isConsumption ? 'm-10' : 'm-15');

    const { containerRef, headerWidths, headerTableWidth } = useGridHeaderColumnWidths(
        hideHeaderRow,
        [colCount, columnConfigs, isConsumption],
    );

    const hasMeasuredHeaderWidths = Boolean(headerWidths?.length);
    const headerColumnCount = headerWidths?.length ?? 0;
    const canSyncToHeader = hideHeaderRow && hasMeasuredHeaderWidths;
    const syncedColCount = canSyncToHeader ? headerColumnCount : colCount;

    const syncedPixelWidths = useMemo(
        () =>
            canSyncToHeader
                ? buildPixelSyncedColumnWidths(headerWidths, headerTableWidth)
                : null,
        [canSyncToHeader, headerWidths, headerTableWidth],
    );

    const getColWidth = (index) => {
        // When header is visible and measured, always use the actual rendered header widths
        // so skeleton body columns align precisely with the header borders.
        if (canSyncToHeader) {
            return resolveSyncedSkeletonColumnWidth({
                index,
                headerWidths,
                headerTableWidth,
                syncToHeader: true,
                columnConfigs: resolvedConfigs,
                columnCount: syncedColCount,
                syncedPixelWidths,
            });
        }

        const configWidth = resolvedConfigs[index]?.width;
        if (configWidth != null) {
            const parsed = parseSkeletonWidth(configWidth);
            if (parsed != null) return parsed;
        }

        return resolveSyncedSkeletonColumnWidth({
            index,
            headerWidths: null,
            headerTableWidth: 0,
            syncToHeader: false,
            columnConfigs: resolvedConfigs,
            columnCount: syncedColCount,
            syncedPixelWidths,
        });
    };

    const getTableWidth = () => {
        if (canSyncToHeader) {
            const resolved = resolveHeaderSyncedTableWidth(headerWidths, headerTableWidth);
            if (resolved > 0) return `${resolved}px`;
        }
        if (hideHeaderRow) return '100%';

        if (headerWidths?.length) {
            const total = sumMeasuredPixelWidths(headerWidths);
            return total > 0 ? `${total}px` : '100%';
        }

        if (!isConsumption || !resolvedConfigs.length) return '100%';

        const total = sumMeasuredPixelWidths(resolvedConfigs.map((col) => col?.width));
        return total > 0 ? `${total}px` : '100%';
    };

    const tableWidth = getTableWidth();
    const tableWidthPx = parseFloat(tableWidth);

    useGridHeaderBodyScrollSync(canSyncToHeader, containerRef, [headerWidths, tableWidthPx]);

    const rootClassName = [
        'rs-grid-loading-skeleton',
        wrapperClass,
        hideHeaderRow ? 'skeleton-body-only' : '',
        isConsumption ? 'consumption-skeleton' : '',
        !isError ? 'no-animation' : '',
        hideHeaderRow && !canSyncToHeader ? 'skeleton-body-pending' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            ref={containerRef}
            className={rootClassName}
            style={
                canSyncToHeader && tableWidthPx > 0
                    ? { width: tableWidth, minWidth: tableWidth }
                    : undefined
            }
        >
            {injectCriticalCss ? <style>{gridLoadingSkeletonCriticalCss}</style> : null}
            <table
                className="k-grid-table k-table"
                style={{
                    width: tableWidth,
                    minWidth: tableWidth,
                    tableLayout: canSyncToHeader ? 'fixed' : undefined,
                }}
            >
                <colgroup>
                    {Array.from({ length: syncedColCount }).map((_, idx) => (
                        <col key={idx} style={{ width: getColWidth(idx) }} />
                    ))}
                </colgroup>
                <tbody className="k-table-tbody">
                    {!hideHeaderRow && (
                        <tr className="k-table-row skeleton-header-row skeleton-blue-row">
                            {Array.from({ length: syncedColCount }).map((_, idx) => (
                                <td key={idx} className="k-table-td skeleton-cell skeleton-blue-cell">
                                    &nbsp;
                                </td>
                            ))}
                        </tr>
                    )}

                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`k-table-row skeleton-row ${rowIndex % 2 === 1 ? 'k-table-alt-row' : ''}`}
                        >
                            {Array.from({ length: syncedColCount }).map((_, colIdx) => (
                                <td key={colIdx} className="k-table-td skeleton-cell">
                                    &nbsp;
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

GridLoadingSkeletonRow.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    columnConfigs: PropTypes.array,
    isConsumption: PropTypes.bool,
    wrapperClassName: PropTypes.string,
    hideHeaderRow: PropTypes.bool,
    isError: PropTypes.bool,
    injectCriticalCss: PropTypes.bool,
};

export default GridLoadingSkeletonRow;
