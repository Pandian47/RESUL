import { memo } from 'react';
import { skeletonBlockStyle } from './mdmSkeletonUtils';

const MdmProfileCardSkeleton = () => (
    <div className="mdm-sk-profile-card">
        <div className="mdm-sk-profile-card-body">
            <div
                className="mdm-sk-profile-card-avatar mdm-sk-block"
                style={skeletonBlockStyle({ width: 50, height: 50, circle: true })}
            />
            <div className="mdm-sk-profile-card-content">
                <div
                    className="mdm-sk-profile-card-label mdm-sk-block"
                    style={skeletonBlockStyle({ width: 48, height: 13 })}
                />
                <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 75, height: 15 })} />
            </div>
        </div>
        <div className="mdm-sk-profile-card-footer">
            <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 120, height: 16 })} />
            <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 22, height: 22, circle: true })} />
        </div>
    </div>
);

export default memo(MdmProfileCardSkeleton);
