const SkelBlock = ({ width, height, className = '', style = {} }) => (
    <span
        className={`skeleton-shimmer ${className}`.trim()}
        style={{ display: 'inline-block', width, height, ...style }}
        aria-hidden="true"
    />
);

/** One accordion header row: [+] icon | label | count badge — matches loaded PlannerModal cards */
const PlannerSectionHeaderSkeleton = ({ labelWidth = 200 }) => (
    <div className="d-flex gap align-items-center planner-modal-skeleton__header-row">
        <SkelBlock width={20} height={20} className="planner-modal-skeleton__icon mt2 mr5" style={{ borderRadius: 4, flexShrink: 0 }} />
        <SkelBlock
            width={labelWidth}
            height={16}
            className="planner-modal-skeleton__label"
            style={{ flex: '0 1 auto' }}
        />
    </div>
);

/** Skeleton for PlannerModal (day click) — matches New / Ongoing communication cards */
const PlannerModalSkeleton = () => (
    <div className="rspem-wrapper planner-modal-skeleton" aria-hidden="true">
        <div className="card mb10 m0 pb0">
            <PlannerSectionHeaderSkeleton labelWidth={450} />
        </div>
        <div className="card mb10 m0 pb0">
            <PlannerSectionHeaderSkeleton labelWidth={450} />
        </div>
    </div>
);

export default PlannerModalSkeleton;
