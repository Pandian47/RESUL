import PropTypes from 'prop-types';
import { gridClass, LAYOUT_CLASSES, SKELETON_LIST_VARIANTS } from './config';

const SKELETON_ICON_COUNT_COMM = 4;
const SKELETON_ICON_COUNT_APP = 5;
const SKELETON_ICON_COUNT_BRAND = 2;

const SkeletonBlock = ({ variant, animated, className = '' }) => (
    <span
        className={[
            gridClass('skeleton-block'),
            variant && gridClass(`skeleton-block--${variant}`),
            className,
            !animated && 'no-animation',
        ]
            .filter(Boolean)
            .join(' ')}
        aria-hidden="true"
    />
);

const SkeletonAccent = ({ animated }) => (
    <span
        className={`${gridClass('skeleton-accent')} ${!animated ? 'no-animation' : ''}`}
        aria-hidden="true"
    />
);

/** Communication listing — badge, meta, title, type cols, status + actions */
const CommunicationListCardSkeleton = ({ animated }) => (
    <div className={`${gridClass('skeleton-list-card')} ${gridClass('skeleton-list-card--communication')}`}>
        <SkeletonAccent animated={animated} />
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--primary')}`}>
            <div className={gridClass('skeleton-row-inline')}>
                <SkeletonBlock variant="badge" animated={animated} />
                <SkeletonBlock variant="meta" animated={animated} />
            </div>
            <SkeletonBlock variant="title" animated={animated} />
        </div>
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--mid')}`}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-md" animated={animated} />
        </div>
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--mid')}`}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-sm" animated={animated} />
        </div>
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--actions')}`}>
            <SkeletonBlock variant="pill" animated={animated} />
            <div className={gridClass('skeleton-icon-row')}>
                {Array.from({ length: SKELETON_ICON_COUNT_COMM }).map((_, index) => (
                    <SkeletonBlock key={index} variant="icon" animated={animated} />
                ))}
            </div>
        </div>
    </div>
);

/** Analytics listing — golden star slot + campaign id row */
const AnalyticsListCardSkeleton = ({ animated }) => (
    <div className={`${gridClass('skeleton-list-card')} ${gridClass('skeleton-list-card--analytics')}`}>
        <SkeletonAccent animated={animated} />
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--primary')}`}>
            <div className={gridClass('skeleton-row-inline')}>
                <SkeletonBlock variant="badge" animated={animated} />
                <SkeletonBlock variant="meta" animated={animated} />
            </div>
            <div className={gridClass('skeleton-row-inline')}>
                <SkeletonBlock variant="indicator" animated={animated} />
                <SkeletonBlock variant="title" animated={animated} />
            </div>
        </div>
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--mid')}`}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-md" animated={animated} />
        </div>
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--mid')}`}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-sm" animated={animated} />
        </div>
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--actions')}`}>
            <SkeletonBlock variant="pill" animated={animated} />
            <div className={gridClass('skeleton-icon-row')}>
                {Array.from({ length: SKELETON_ICON_COUNT_COMM }).map((_, index) => (
                    <SkeletonBlock key={index} variant="icon" animated={animated} />
                ))}
            </div>
        </div>
    </div>
);

/** App notification — column widths match .rslgw-content (30 / 20 / 35 / 17 % + actions) */
const AppListCardSkeleton = ({ animated }) => (
    <div className={`rs-list-grid-wrapper ${gridClass('skeleton-list-card--app')}`}>
        <div className={gridClass('skeleton-col--app')}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-md" animated={animated} />
        </div>
        <div className={gridClass('skeleton-col--app')}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-sm" animated={animated} />
        </div>
        <div className={gridClass('skeleton-col--app')}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-md" animated={animated} />
        </div>
        <div className={gridClass('skeleton-col--app')}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-sm" animated={animated} />
        </div>
        <div className={gridClass('skeleton-col--app-actions')}>
            <div className={gridClass('skeleton-icon-row')}>
                {Array.from({ length: SKELETON_ICON_COUNT_APP }).map((_, index) => (
                    <SkeletonBlock key={index} variant="icon" animated={animated} />
                ))}
            </div>
        </div>
        <span className={`${gridClass('skeleton-expand-corner')} ${!animated ? 'no-animation' : ''}`} aria-hidden="true" />
    </div>
);

/** Brand / shop — avatar + badge + legal name + location + status */
const BrandListCardSkeleton = ({ animated }) => (
    <div
        className={`${gridClass('skeleton-list-card')} ${gridClass('skeleton-list-card--brand')} ${
            !animated ? 'no-animation' : ''
        }`}
    >
        <div className={gridClass('skeleton-col--brand-primary')}>
            <div className={`${gridClass('skeleton-row-inline')} ${gridClass('skeleton-brand-title-row')}`}>
                <SkeletonBlock variant="avatar" animated={animated} />
                <div className={gridClass('skeleton-brand-text')}>
                    <SkeletonBlock variant="badge" animated={animated} />
                    <SkeletonBlock variant="title" animated={animated} />
                </div>
            </div>
        </div>
        <div className={gridClass('skeleton-col--brand-location')}>
            <SkeletonBlock variant="label" animated={animated} />
            <SkeletonBlock variant="line-md" animated={animated} />
        </div>
        <div className={gridClass('skeleton-col--brand-spacer')} aria-hidden="true" />
        <div className={`${gridClass('skeleton-col')} ${gridClass('skeleton-col--actions')}`}>
            <SkeletonBlock variant="pill" animated={animated} />
            <div className={gridClass('skeleton-icon-row--brand')}>
                {Array.from({ length: SKELETON_ICON_COUNT_BRAND }).map((_, index) => (
                    <SkeletonBlock key={index} variant="icon" animated={animated} />
                ))}
            </div>
        </div>
        <span className={`${gridClass('skeleton-expand-corner')} ${!animated ? 'no-animation' : ''}`} aria-hidden="true" />
    </div>
);

const LIST_SKELETON_BY_VARIANT = {
    communication: CommunicationListCardSkeleton,
    analytics: AnalyticsListCardSkeleton,
    app: AppListCardSkeleton,
    brand: BrandListCardSkeleton,
};

const ListCardSkeleton = ({ variant = 'communication', animated }) => {
    const CardSkeleton = LIST_SKELETON_BY_VARIANT[variant] || CommunicationListCardSkeleton;
    return <CardSkeleton animated={animated} />;
};

const TableSkeleton = ({ rows, columns, columnConfigs, animated, showHeader }) => {
    const colCount = columnConfigs?.length > 0 ? columnConfigs.length : columns;

    const getColumnWidth = (index) => {
        const width = columnConfigs?.[index]?.width;
        if (!width) return null;
        return typeof width === 'number' ? `${width}px` : width;
    };

    return (
        <table className="k-grid-table k-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody className="k-table-tbody">
                {showHeader && (
                    <tr className="k-table-row skeleton-blue-row" style={{ height: 44 }}>
                        {Array.from({ length: colCount }).map((_, idx) => (
                            <td
                                key={`h-${idx}`}
                                className={`k-table-td skeleton-cell skeleton-blue-cell ${animated ? '' : 'no-animation'}`}
                                style={{
                                    padding: 10,
                                    height: 44,
                                    width: getColumnWidth(idx) || undefined,
                                }}
                            >
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
                        {Array.from({ length: colCount }).map((_, colIdx) => (
                            <td
                                key={colIdx}
                                className={`k-table-td skeleton-cell ${animated ? '' : 'no-animation'}`}
                                style={{
                                    padding: 10,
                                    height: 44,
                                    width: getColumnWidth(colIdx) || undefined,
                                }}
                            >
                                &nbsp;
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const GridSkeleton = ({
    rows = 5,
    columns = 5,
    columnConfigs = [],
    layout = 'table',
    listVariant = 'communication',
    animated = true,
    showHeader = true,
}) => {
    const resolvedVariant = SKELETON_LIST_VARIANTS.includes(listVariant) ? listVariant : 'communication';

    if (layout === 'list') {
        return (
            <div
                className={`${gridClass('skeleton-list')} ${gridClass(`skeleton-list--${resolvedVariant}`)}`}
                role="status"
                aria-label="Loading"
            >
                {Array.from({ length: rows }).map((_, index) => (
                    <ListCardSkeleton key={index} variant={resolvedVariant} animated={animated} />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`${LAYOUT_CLASSES.loadingSkeleton} ${gridClass('skeleton')} ${animated ? '' : 'no-animation'}`}
        >
            <TableSkeleton
                rows={rows}
                columns={columns}
                columnConfigs={columnConfigs}
                animated={animated}
                showHeader={showHeader}
            />
        </div>
    );
};

GridSkeleton.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    columnConfigs: PropTypes.array,
    layout: PropTypes.oneOf(['table', 'list']),
    listVariant: PropTypes.oneOf(SKELETON_LIST_VARIANTS),
    animated: PropTypes.bool,
    showHeader: PropTypes.bool,
};

export default GridSkeleton;
export { CommunicationListCardSkeleton, AnalyticsListCardSkeleton, BrandListCardSkeleton };
