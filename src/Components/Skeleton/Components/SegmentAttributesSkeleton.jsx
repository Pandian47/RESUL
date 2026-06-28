import { memo } from 'react';
import PropTypes from 'prop-types';

import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { segmentSkeletonCriticalCss } from './segmentSkeletonCriticalCss';
import { ATTRIBUTE_GROUP_COUNT, ATTRIBUTE_TAG_WIDTHS, skeletonBarStyle } from './segmentSkeletonUtils';

const SkelBar = ({ width, height, circle = false, className = '' }) => (
    <span
        className={`skeleton-shimmer ${className}`.trim()}
        style={skeletonBarStyle({ width, height, circle })}
        aria-hidden="true"
    />
);

const SegmentAttributeTagsSkeleton = ({ groupIndex = 0 }) => (
    <div className="tl-segment-attributes-skeleton__tags">
        {ATTRIBUTE_TAG_WIDTHS.map((width, tagIndex) => (
            <SkelBar key={`${groupIndex}-tag-${tagIndex}`} width={width} height={25} />
        ))}
    </div>
);

const SegmentAttributesSkeleton = ({ isError = false, injectCriticalCss = true }) => (
    <div
        className={`skeleton-span-con p0 tl-segment-attributes-skeleton${isError ? ' tl-segment-skeleton--static' : ''}`}
        aria-hidden={!isError}
    >
        {injectCriticalCss ? <style>{segmentSkeletonCriticalCss}</style> : null}
        {isError ? <NoDataAvailableRender /> : null}
        <div className="tl-segment-attributes-skeleton__toolbar">
            <div className="tl-segment-attributes-skeleton__toolbar-left">
                <SkelBar width={120} height={24} />
            </div>
            <SkelBar width={32} height={32} circle />
        </div>
        <div className="tl-attribtueSkeleton-block tl-segment-attributes-skeleton__card">
            <div className="tl-segment-attributes-skeleton__expand-icon">
                <SkelBar width={30} height={30} circle />
            </div>
            {Array.from({ length: ATTRIBUTE_GROUP_COUNT }, (_, index) => (
                <div
                    key={index}
                    className={`tl-segment-attributes-skeleton__group${index === 0 ? ' tl-segment-attributes-skeleton__group--first' : ''}`}
                >
                    <div className="tl-segment-attributes-skeleton__group-header">
                        <div className="tl-segment-attributes-skeleton__group-title">
                            <SkelBar width={20} height={20} circle />
                            <SkelBar width={90} height={20} />
                        </div>
                        <SkelBar width={20} height={20} circle />
                    </div>
                    <SegmentAttributeTagsSkeleton groupIndex={index} />
                </div>
            ))}
        </div>
    </div>
);

SegmentAttributesSkeleton.propTypes = {
    isError: PropTypes.bool,
    injectCriticalCss: PropTypes.bool,
};

export default memo(SegmentAttributesSkeleton);
