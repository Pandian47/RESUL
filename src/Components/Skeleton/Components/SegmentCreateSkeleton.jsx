import { memo } from 'react';
import PropTypes from 'prop-types';

import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { segmentSkeletonCriticalCss } from './segmentSkeletonCriticalCss';
import { skeletonBarStyle } from './segmentSkeletonUtils';

const SkelBar = ({ width, height, circle = false, className = '' }) => (
    <span
        className={`skeleton-shimmer ${className}`.trim()}
        style={skeletonBarStyle({ width, height, circle })}
        aria-hidden="true"
    />
);

const SegmentCreateSkeleton = ({ isError = false, injectCriticalCss = true }) => (
    <div
        className={`skeleton-span-con p0 tl-segment-create-skeleton${isError ? ' tl-segment-skeleton--static' : ''}`}
        aria-hidden={!isError}
    >
        {injectCriticalCss ? <style>{segmentSkeletonCriticalCss}</style> : null}
        {isError ? <NoDataAvailableRender /> : null}
        <div className="tl-segment-create-skeleton__card">
            <div className="tl-segment-create-skeleton__header">
                <SkelBar width={80} height={20} />
                <div className="tl-segment-create-skeleton__header-actions">
                    <SkelBar width={100} height={20} />
                    <SkelBar width={100} height={20} />
                </div>
            </div>
            <div className="tl-segment-create-skeleton__center">
                <SkelBar width={300} height={22} />
            </div>
            <div className="tl-segment-create-skeleton__plus">
                <SkelBar width={30} height={30} circle />
            </div>
        </div>
    </div>
);

SegmentCreateSkeleton.propTypes = {
    isError: PropTypes.bool,
    injectCriticalCss: PropTypes.bool,
};

export default memo(SegmentCreateSkeleton);
