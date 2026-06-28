const FACT_ROWS = [
    { labelWidth: 100, valueWidth: 48 },
    { labelWidth: 56, valueWidth: 40 },
    { labelWidth: 88, valueWidth: 44 },
    { labelWidth: 80, valueWidth: 52 },
];

/** Inline skeleton for gallery card GetChannelFact metrics (rsgpc-bottom). */
const GalleryFactSkeleton = () => (
    <ul className="rsgpc-bottom gallery-fact-skeleton" aria-hidden="true">
        {FACT_ROWS.map((row, index) => (
            <li key={`gallery-fact-skel-${index}`}>
                <span
                    className="skeleton-shimmer gallery-fact-skeleton__label"
                    style={{ width: row.labelWidth, height: 14 }}
                />
                <span
                    className="skeleton-shimmer gallery-fact-skeleton__value"
                    style={{ width: row.valueWidth, height: 16 }}
                />
            </li>
        ))}
    </ul>
);

export default GalleryFactSkeleton;
