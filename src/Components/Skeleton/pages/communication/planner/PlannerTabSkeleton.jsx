import { memo } from 'react';
import CommunicationPlannerSkeleton from './CommunicationPlannerSkeleton';

/** Communication › Planner tab — calendar grid (matches loaded Planner) */
const PlannerTabSkeleton = () => (
    <div className="communication-planner-tab-skeleton">
        <CommunicationPlannerSkeleton calendarOnly />
    </div>
);

export default memo(PlannerTabSkeleton);
