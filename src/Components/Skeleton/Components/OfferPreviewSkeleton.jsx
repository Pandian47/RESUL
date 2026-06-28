import {Card} from 'react-bootstrap'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
function OfferPreviewSkeleton() {
    return (
        <div className='offer-preview-container'>
            <div className="offer-preview-scroll-wrapper">
                <Card className="offer-preview-card">
                    <Card.Body
                        className="offer-card-body d-flex flex-column p-0"
                        style={{ maxHeight: 'calc(100vh - 140px)' }}
                    >
                        {/* Header: Logo and Display Name Skeleton */}
                        <div className="preview-header p-2 border-bottom">
                            <div className="d-flex align-items-center">
                                <div className="preview-logo-container me-3 position-relative bottom4">
                                    <Skeleton circle height={35} width={35} enableAnimation={false} />
                                </div>
                                <div className="flex-grow-1">
                                    <Skeleton height={24} width="60%" enableAnimation={false} />
                                </div>
                            </div>
                        </div>
                        <div className='offer-preview-content-wrapper css-scrollbar'>
                            {/* Banner Section Skeleton */}
                            <div className="preview-banner-section position-sticky">
                                <div className="preview-banner-container py10 pl10 pr5">
                                    <Skeleton height={200} width="100%" enableAnimation={false} />
                                </div>
                            </div>
                            {/* Content Skeleton */}

                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>)
}

export default OfferPreviewSkeleton