const SkelBlock = ({ width, height, className = '', style = {} }) => (
    <span
        className={`skeleton-shimmer ${className}`.trim()}
        style={{ display: 'inline-block', width, height, ...style }}
        aria-hidden="true"
    />
);

const PlannerSectionHeaderSkeleton = ({ labelWidth = 200 }) => (
    <div className="rspem-section-header d-flex align-items-center gap-2">
        <SkelBlock width={24} height={24} className="planner-modal-skeleton__icon flex-shrink-0" />
        <SkelBlock
            width={labelWidth}
            height={20}
            className="planner-modal-skeleton__label flex-grow-1"
            style={{ maxWidth: '100%', borderRadius: 4 }}
        />
        <SkelBlock width={32} height={24} className="planner-modal-skeleton__count flex-shrink-0" style={{ borderRadius: 12 }} />
    </div>
);

/** Skeleton for PlannerModal — matches New / Ongoing communication section headers */
const PlannerModalSkeleton = ({ sectionCount = 2 }) => (
    <div className="rspem-wrapper planner-modal-skeleton" aria-hidden="true">
        <div className="rspem-sections">
            {Array.from({ length: sectionCount }, (_, index) => (
                <div key={index} className="card rspem-section-card mb0">
                    <PlannerSectionHeaderSkeleton labelWidth={index === 0 ? 180 : 210} />
                </div>
            ))}
        </div>
    </div>
);

export default PlannerModalSkeleton;
