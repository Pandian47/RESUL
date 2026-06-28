import { useCallback } from 'react';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { NO_RECORDS_FOUND } from 'Constants/GlobalConstant/Placeholders';

const GRID_SKELETON_HEADER_BG = '#0043ff';
const GRID_SKELETON_BORDER_RADIUS = 'var(--globalBorderRadius, 7px)';

const GridLoadingSkeleton = ({ rows = 5, columns = 6, showNoData, isLoading = true, isConsumption = false, columnConfigs = [], isShowHeader = false, noDataText = '', noDataShowIcon = true, wrapperClassName = '', hideLeftBorder = false }) => {
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

    const formatWidth = useCallback((width) => {
        if (width === null || width === undefined) return null;
        if (typeof width === 'number' && !Number.isNaN(width)) {
            return `${width}px`;
        }
        if (typeof width === 'string') {
            const trimmed = width.trim();
            if (trimmed === '') return null;
            if (/[a-z%]+$/i.test(trimmed)) {
                return trimmed;
            }
            const numericPart = parseFloat(trimmed);
            if (!Number.isNaN(numericPart)) {
                return `${numericPart}px`;
            }
        }
        return null;
    }, []);

    const actualColumns = isShowHeader && columnConfigs?.length > 0 ? columnConfigs.length : columns;
    const getRowBackgroundColor = (index) => {
        return index % 2 === 1 ? '#f5f5f5' : '#ffffff';
    };

    const getColumnWidth = (index) => {
        if (!isShowHeader || !columnConfigs || columnConfigs.length === 0) {
            return null;
        }
        
        const widthValue = columnConfigs[index]?.width;

        if (isConsumption) {
            const formattedWidth = formatWidth(widthValue);
            if (formattedWidth) {
                return formattedWidth;
            }
            const normalizedWidth = normalizeWidthValue(widthValue);
            return formatWidth(normalizedWidth);
        }

        if (widthValue) {
            const formattedWidth = formatWidth(widthValue);
            if (formattedWidth) {
                return formattedWidth;
            }
        }
        const columnsWithWidth = columnConfigs.filter(col => col?.width);
        if (columnsWithWidth.length === 0) {
            return null;
        }

        const totalWidth = columnConfigs.reduce((sum, col) => sum + normalizeWidthValue(col?.width, 0), 0);
        const columnWidth = normalizeWidthValue(widthValue, 0);
        
        if (totalWidth > 0 && columnWidth > 0) {
            const percentage = Math.max((columnWidth / totalWidth) * 100, 0);
            return `${percentage.toFixed(2)}%`;
        }

        return null;
    };

    const getBlueHeaderCellStyle = (index, columnWidth) => ({
        padding: '10px',
        height: 44,
        backgroundColor: GRID_SKELETON_HEADER_BG,
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        ...(index < actualColumns - 1 && { borderRight: '1px solid #c2cfe3' }),
        ...(index === actualColumns - 1 && { borderRight: 0 }),
        ...(index === 0 && { borderTopLeftRadius: GRID_SKELETON_BORDER_RADIUS }),
        ...(index === actualColumns - 1 && { borderTopRightRadius: GRID_SKELETON_BORDER_RADIUS }),
        ...(isShowHeader && columnWidth
            ? { width: columnWidth }
            : {
                minWidth: '100px',
                maxWidth: isConsumption ? `${100 / actualColumns}%` : '',
            }),
    });

    const getBodyCellStyle = (rowIndex, colIndex, columnWidth) => ({
        padding: '10px',
        height: 44,
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        ...(colIndex < actualColumns - 1 && { borderRight: '1px solid #c2cfe3' }),
        ...(colIndex === actualColumns - 1 && { borderRight: 0 }),
        ...(rowIndex === rows - 1 && colIndex === 0 && { borderBottomLeftRadius: GRID_SKELETON_BORDER_RADIUS }),
        ...(rowIndex === rows - 1 && colIndex === actualColumns - 1 && { borderBottomRightRadius: GRID_SKELETON_BORDER_RADIUS }),
        ...(isShowHeader && columnWidth
            ? {
                width: columnWidth,
                minWidth: columnWidth,
                maxWidth: columnWidth,
            }
            : {
                minWidth: '100px',
                maxWidth: isConsumption ? `${100 / actualColumns}%` : '',
            }),
    });

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
            case (totalWidth > 7800):
                return '16%';
            case (totalWidth > 7500):
                return '17%';
            case (totalWidth > 6500):
                return '19%';
            case (totalWidth > 6300):
                return '20%';
            case (totalWidth > 6000):
                return '21%';
            case (totalWidth > 3500):
                return '34%';
            case (totalWidth > 3000):
                return '40%';
            case (totalWidth > 2000):
                return '48%';
            default:
                return '100%';
        }
    };
    const wrapperClass = wrapperClassName || 'm-15';
    return (
        <div className={`rs-grid-loading-skeleton ${wrapperClass} ${!isLoading ? 'no-animation' : ''} ${isShowHeader ? 'pl6 pr3' : ''}`} style={isConsumption ? { maxWidth: '100%', overflow: 'hidden' } : {}}>
               {showNoData && (
                                                <div style={{ 
                                                    position: "absolute",
    left: "50%",
    transform: isShowHeader ? "translate(31px, -12px)"  : "translate(15px, 20px)",
    whiteSpace: "nowrap",
    zIndex: "10",
    top: "50%",
                                                }}>
                                                    <NoDataAvailableRender
                                                        message={noDataText || NO_RECORDS_FOUND}
                                                        isShowIcon={noDataShowIcon}
                                                    />
                                                </div>
                                            ) }
            <table
                className="k-grid-table k-table"
                style={{ 
                width: isShowHeader ? '100%' : (isConsumption ? `${calculateTotalWidth()}px` : '100%'), 
                maxWidth: isShowHeader ? 'none' : calculateMaxWidth(), 
                borderCollapse: 'separate',
                borderSpacing: 0,
                tableLayout: isShowHeader ? 'auto' : 'fixed',
                border: 0,
            }}>
                <tbody className="k-table-tbody">
                    <tr className={`k-table-row skeleton-blue-row ${isShowHeader ? 'hide' : ''}`} style={{ height: 44, backgroundColor: GRID_SKELETON_HEADER_BG }}>
                        {Array.from({ length: actualColumns }).map((_, idx) => {
                            const columnWidth = getColumnWidth(idx);
                            return (
                                <td 
                                    key={idx} 
                                    className={`k-table-td skeleton-cell skeleton-blue-cell ${!isLoading ? 'no-animation' : ''}`}
                                    style={getBlueHeaderCellStyle(idx, columnWidth)}
                                >
                                    &nbsp;
                                </td>
                            );
                        })}
                    </tr>
                    {Array.from({ length: rows }).map((_, rowIndex) => {
                        const bgColor = getRowBackgroundColor(rowIndex);
                        return (
                            <tr 
                                key={rowIndex} 
                                className={`k-table-row skeleton-row ${rowIndex % 2 === 1 ? 'k-table-alt-row' : ''}`}
                                style={{ 
                                    backgroundColor: bgColor,
                                }}
                            >
                                {Array.from({ length: actualColumns }).map((_, colIdx) => {
                                    const columnWidth = getColumnWidth(colIdx);
                                    return (
                                        <td 
                                            key={colIdx} 
                                            className={`k-table-td skeleton-cell ${!isLoading ? 'no-animation' : ''}`}
                                            style={getBodyCellStyle(rowIndex, colIdx, columnWidth)}
                                        >
                                         
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
export default GridLoadingSkeleton;