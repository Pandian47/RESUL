import { memo } from 'react';
import { skeletonBlockStyle } from './mdmSkeletonUtils';

const MdmOverviewHeaderSkeleton = () => (
    <div className="mdm-sk-overview-header">
        <div className="mdm-sk-overview-title">
            <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 96, height: 35, radius: 5 })} />
        </div>
        <ul className="mdm-sk-overview-actions">
            <li>
                <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 28, height: 28, circle: true })} />
            </li>
            <li>
                <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 28, height: 28, circle: true })} />
            </li>
        </ul>
    </div>
);

export default memo(MdmOverviewHeaderSkeleton);
