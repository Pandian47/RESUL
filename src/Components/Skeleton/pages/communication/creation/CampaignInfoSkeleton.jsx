import { memo } from 'react';
import PropTypes from 'prop-types';

import { SkeletonShimmer, SKELETON_SHIMMER_VARIANT } from 'Components/Skeleton/Components/common';

const CAMPAIGN_INFO_FIELD_COUNT = 4;

/** Campaign summary header — Name / Period / Type / Primary goal + actions. */
const CampaignInfoSkeleton = ({ className = '' }) => (
    <div className={`cc-campaign-info-skeleton authoring-campaign-info-skeleton ${className}`.trim()} aria-hidden="true">
        <div className="cc-campaign-info-skeleton__row authoring-campaign-info-skeleton__row">
            <div className="cc-campaign-info-skeleton__cols authoring-campaign-info-skeleton__cols">
                {Array.from({ length: CAMPAIGN_INFO_FIELD_COUNT }, (_, index) => (
                    <div
                        key={index}
                        className="cc-campaign-info-skeleton__col authoring-campaign-info-skeleton__col"
                    >
                        <SkeletonShimmer
                            className="cc-campaign-info-skeleton__label authoring-campaign-info-skeleton__label"
                            width={48}
                            height={24}
                        />
                        <SkeletonShimmer
                            className="cc-campaign-info-skeleton__value authoring-campaign-info-skeleton__value"
                            width="85%"
                            height={24}
                        />
                    </div>
                ))}
            </div>
            <div className="cc-campaign-info-skeleton__actions authoring-campaign-info-skeleton__actions">
                <SkeletonShimmer
                    className="cc-campaign-info-skeleton__action authoring-campaign-info-skeleton__action"
                    variant={SKELETON_SHIMMER_VARIANT.CIRCLE}
                    size={36}
                />
                <SkeletonShimmer
                    className="cc-campaign-info-skeleton__action authoring-campaign-info-skeleton__action"
                    variant={SKELETON_SHIMMER_VARIANT.CIRCLE}
                    size={36}
                />
            </div>
        </div>
    </div>
);

CampaignInfoSkeleton.propTypes = {
    className: PropTypes.string,
};

export default memo(CampaignInfoSkeleton);
