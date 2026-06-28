import { memo } from 'react';
import { BUBBLE_PLACEHOLDERS, skeletonBlockStyle } from './mdmSkeletonUtils';

/** Shared bubble chart skeleton — used for initial page load and live chart loading. */
export const MdmOverviewBubbleSkeleton = () => (
    <div className="mdm-overview-chart-body">
        <div className="bubble-chart-skeleton">
            {BUBBLE_PLACEHOLDERS.map((bubble) => (
                <div
                    key={`${bubble.left}-${bubble.top}`}
                    className="bubble-chart-skeleton__bubble mdm-sk-block"
                    style={{
                        left: bubble.left,
                        top: bubble.top,
                        ...skeletonBlockStyle({
                            width: bubble.width,
                            height: bubble.height,
                            circle: true,
                        }),
                    }}
                />
            ))}
        </div>
    </div>
);

export default memo(MdmOverviewBubbleSkeleton);
