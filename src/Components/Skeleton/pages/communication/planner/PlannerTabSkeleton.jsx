import { memo } from 'react';
import PropTypes from 'prop-types';
import CommunicationPlannerSkeleton from './CommunicationPlannerSkeleton';

/** Communication › Planner tab — toolbar + calendar grid (matches loaded Planner). */
const PlannerTabSkeleton = ({ showToolbar = true }) => (
    <div className="communication-planner-tab-skeleton">
        <CommunicationPlannerSkeleton showToolbar={showToolbar} />
    </div>
);

PlannerTabSkeleton.propTypes = {
    showToolbar: PropTypes.bool,
};

export default memo(PlannerTabSkeleton);
