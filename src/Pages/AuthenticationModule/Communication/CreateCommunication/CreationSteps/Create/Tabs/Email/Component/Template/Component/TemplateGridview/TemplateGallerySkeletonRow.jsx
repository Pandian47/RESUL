import { Row } from 'react-bootstrap';

import SkeletonGalleryCard from 'Components/Skeleton/Components/SkeletonGalleryCard.jsx';

export const TEMPLATE_GALLERY_SKELETON_WEB = {
    cardHeight: 358,
    cardPadding: 10,
    previewHeight: 292,
};

export const TEMPLATE_GALLERY_SKELETON_AI = {
    cardHeight: 278,
    cardPadding: 10,
    previewHeight: 212,
};

const TemplateGallerySkeletonRow = ({
    isLoading,
    count = 4,
    col = 3,
    rowClassName = 'mt15 mb15',
    wrapInRow = true,
    cardHeight,
    cardPadding,
    previewHeight,
    hideBottomAccent = true,
    isNoDataAvailable = false,
}) => {
    const cards = Array.from({ length: count }).map((_, idx) => (
        <SkeletonGalleryCard
            key={`loading-skeleton-${idx}`}
            isLoading={isLoading}
            col={col}
            cardHeight={cardHeight}
            cardPadding={cardPadding}
            previewHeight={previewHeight}
            hideBottomAccent={hideBottomAccent}
            isNoDataAvailable = {isNoDataAvailable}
        />
    ));

    if (!wrapInRow) {
        return <>{cards}</>;
    }

    return <Row className={rowClassName}>{cards}</Row>;
};

export default TemplateGallerySkeletonRow;
