import { memo } from 'react';
import PropTypes from 'prop-types';

import { SkeletonShimmer, SKELETON_SHIMMER_VARIANT } from 'Components/Skeleton/Components/common';

const DEFAULT_STEP_COUNT = 3;
const STEP_TITLE_WIDTH = 70;

/** Matches RSProgressSteps on Planning page — shimmer only; spacing in critical CSS. */
const PlanProgressStepsSkeleton = ({ stepCount = DEFAULT_STEP_COUNT, className = '' }) => (
    <div
        className={`cc-plan-steps-skeleton plan-progress-steps-skeleton ${className}`.trim()}
        aria-hidden="true"
    >
        <ul className="cc-plan-steps-skeleton__list plan-progress-steps-skeleton__list">
            {Array.from({ length: stepCount }, (_, index) => (
                <li
                    key={index}
                    className="cc-plan-steps-skeleton__item plan-progress-steps-skeleton__item"
                >
                    <SkeletonShimmer
                        className="cc-plan-steps-skeleton__step plan-progress-steps-skeleton__step"
                        variant={SKELETON_SHIMMER_VARIANT.CIRCLE}
                        size={32}
                    />
                    <SkeletonShimmer
                        className="cc-plan-steps-skeleton__title plan-progress-steps-skeleton__title"
                        width={STEP_TITLE_WIDTH}
                        height={15}
                    />
                </li>
            ))}
        </ul>
    </div>
);

PlanProgressStepsSkeleton.propTypes = {
    stepCount: PropTypes.number,
    className: PropTypes.string,
};

export default memo(PlanProgressStepsSkeleton);
