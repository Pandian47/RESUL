import { memo } from 'react';
import PropTypes from 'prop-types';

import { SkeletonCommunicationList } from '../../../Components/SkeletonCommunicationList';
import ListToolbarSkeleton from './ListToolbarSkeleton';

/** Communication › List tab — matches HeaderCell toolbar + list loading (`mt15`). */
const ListTabSkeleton = ({ count = 5, isLoading = true, showToolbar = true }) => (
    <div className="communication-list-tab-skeleton">
        {showToolbar ? <ListToolbarSkeleton /> : null}
        <div className="rs-grid-listing communication-list-tab-skeleton__rows mt15">
            <SkeletonCommunicationList count={count} isLoading={isLoading} />
        </div>
    </div>
);


ListTabSkeleton.propTypes = {
    count: PropTypes.number,
    isLoading: PropTypes.bool,
    showToolbar: PropTypes.bool,
};

export default memo(ListTabSkeleton);
