
const GridLoadingSkeletonRow = ({
    rows = 5,
    columns = 5,
    columnConfigs = [],
    isConsumption = false,
    wrapperClassName = '',
    hideLeftBorder = false,
    hideRightBorder = false,
    isError = true,
}) => {
    const getRowBackgroundColor = (index) => {
        return index % 2 === 1 ? '#f5f5f5' : '#ffffff';
    };
    const getColumnWidth = (index) => {
        if (columnConfigs && columnConfigs[index] && columnConfigs[index].width) {
            return columnConfigs[index].width;
        }
        return undefined;
    };

    const wrapperClass = wrapperClassName || (isConsumption ? 'm-10' : 'm-15');
    return (
        <div className={`rs-grid-loading-skeleton ${wrapperClass} ${!isError ? 'no-animation' : ''}`}>
            <table className="k-grid-table k-table" style={{ width: '100%', borderCollapse: 'collapse'}}>
                <tbody className="k-table-tbody">
                    <tr className={`k-table-row ${isConsumption ? '' : 'skeleton-blue-row'}`} style={{ height: 44, backgroundColor: isConsumption ? '' : '#0043ff' }}>
                        {Array.from({ length: columns }).map((_, idx) => (
                            <td 
                                key={idx} 
                                className={`k-table-td skeleton-cell skeleton-blue-cell ${(hideLeftBorder || (isConsumption && idx === 0)) ? 'no-border-left' : ''} ${
                                    hideRightBorder && idx === columns - 1 ? 'no-border-right' : ''
                                } ${!isError ? 'no-animation' : ''}`}
                                style={{ 
                                    padding: '12px 16px', 
                                    height: 44,
                                    backgroundColor: '#0043ff',
                                    ...((hideLeftBorder || (isConsumption && idx === 0)) && idx === 0 && { borderLeft: 0 }),
                                    ...(hideRightBorder && idx === columns - 1 && { borderRight: 0 }),
                                    ...(isConsumption && { width: getColumnWidth(idx) }),
                                    ...(isConsumption && { minWidth: getColumnWidth(idx) }),
                                    ...(isConsumption && { maxWidth: getColumnWidth(idx) }),
                                    ...(isConsumption && idx === 1 && { borderLeft: 0 }),
                                    // ...(isConsumption && idx === 0 && { borderTopLeftRadius: '10px', borderLeft: 0 }),
                                    ...(isConsumption && idx === columns - 1 && { borderTopRightRadius: '10px' }),
                                }}
                            >
                                &nbsp;
                            </td>
                        ))}
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
                                {Array.from({ length: columns }).map((_, colIdx) => (
                                    <td 
                                        key={colIdx} 
                                        className={`k-table-td skeleton-cell ${(hideLeftBorder || (isConsumption && colIdx === 0)) ? 'no-border-left' : ''} ${
                                            hideRightBorder && colIdx === columns - 1 ? 'no-border-right' : ''
                                        } ${!isError ? 'no-animation' : ''}`}
                                        style={{
                                            padding: '12px 16px',
                                            height: 44,
                                            ...(hideLeftBorder && colIdx === 0 && { borderLeft: 0 }),
                                            ...(hideRightBorder && colIdx === columns - 1 && { borderRight: 0 }),
                                            ...(isConsumption && { width: getColumnWidth(colIdx) }),
                                            ...(isConsumption && { minWidth: getColumnWidth(colIdx) }),
                                            ...(isConsumption && { maxWidth: getColumnWidth(colIdx) }),
                                        }}
                                    >
                                        &nbsp;
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default GridLoadingSkeletonRow;
