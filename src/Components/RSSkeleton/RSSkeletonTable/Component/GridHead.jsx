export const GridHead = ({ animation = true, stopAnimation = false }) => {
    const isAnimated = animation && !stopAnimation;

    return (
        <div
            className={`rs-skeleton-table__bar skeleton${isAnimated ? ' skeleton-shimmer' : ''}`}
            aria-hidden="true"
        />
    );
};
