import { memo } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';

import SkeletonGalleryCard from '../../../Components/SkeletonGalleryCard.jsx';
import { CommonSkeleton } from '../../../Components/SkeletonOverall';

/** Communication › Gallery tab — toolbar + 4 cards (matches loaded Gallery) */
const GalleryTabSkeleton = ({ cardCount = 4, showToolbar = true }) => (
    <div className="communication-gallery-tab-skeleton">
        {showToolbar ? (
        <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer mb21">
            <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                <CommonSkeleton box width={240} height={32} stopAnimation />
                <CommonSkeleton box width={120} height={32} stopAnimation />
                <CommonSkeleton circle width={32} height={32} stopAnimation />
                <CommonSkeleton circle width={32} height={32} stopAnimation />
            </div>
        </div>
        ) : null}
        <Row className="mt15 mb15">
            {Array.from({ length: cardCount }, (_, idx) => (
                <SkeletonGalleryCard key={idx} isLoading col={3} />
            ))}
        </Row>
    </div>
);

GalleryTabSkeleton.propTypes = {
    cardCount: PropTypes.number,
    showToolbar: PropTypes.bool,
};

export default memo(GalleryTabSkeleton);
