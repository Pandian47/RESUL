import { memo } from 'react';
import { CommonSkeleton } from '../../../Components/SkeletonOverall';

/** Matches List tab `HeaderCell` / advance search row. */
const ListToolbarSkeleton = () => (
    <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer w-100">
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end w-100">
            <CommonSkeleton box width={240} height={32} stopAnimation />
            <CommonSkeleton box width={120} height={32} stopAnimation />
            <CommonSkeleton circle width={32} height={32} stopAnimation />
            <CommonSkeleton circle width={32} height={32} stopAnimation />
        </div>
    </div>
);

export default memo(ListToolbarSkeleton);
