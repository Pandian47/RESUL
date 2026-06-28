import { Row, Col, Carousel, Badge } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons/index.jsx';
import {
    NO_LIMIT,
    DAYS_TEXT,
    CLAIM_OFFER,
    DETAILS,
    VALIDITY,
    MIN_SPEND,
    MAX_DISCOUNT,
    APPLICABLE_DAYS,
    TERMSCONDITIONS,
} from 'Constants/GlobalConstant/Placeholders';

function OfferDetailModal({ show, onHide, offerData, onClaimOffer }) {
    if (!offerData) return null;

    // Helper functions
    const getDayNames = (daysString) => {
        if (!daysString) return 'All days';
        const dayMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
        const days = daysString
            .split(',')
            .map((d) => dayMap[d.trim()])
            .filter(Boolean);
        return days.length > 0 ? days.join(', ') : 'All days';
    };

    const getValidityDays = (endDate) => {
        if (!endDate) return NO_LIMIT;
        const start = new Date();
        const end = new Date(endDate);
        const diff = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        return `${diff} ${DAYS_TEXT}`;
    };

    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);
        return `₹${amount.toFixed(2)}`;
    };

    const formatTimeRange = (startTime, endTime) => {
        if (!startTime || !endTime) return 'All day';
        return `${startTime} - ${endTime}`;
    };

    const offerDisplayName = offerData?.OfferDisplayName || offerData?.offerDisplayName || '';
    const offerDescription = offerData?.OfferDescription || offerData?.offerDescription || '';
    const offerTags = offerData?.Tags || offerData?.tags || [];
    const minSpend = offerData?.MinPurchaseValue ?? offerData?.minPurchaseValue ?? 0;
    const maxDiscount =
        offerData?.MaxDiscountCap ??
        offerData?.maxDiscountCap ??
        offerData?.MaxPurchaseDiscount ??
        offerData?.maxPurchaseDiscount ??
        0;
    const applicableDays = offerData?.ApplicableDays || offerData?.applicableDays || '';
    const offerEndTime = offerData?.OfferEndTime || offerData?.offerEndTime;
    const termsAndConditions = offerData?.TermsAndConditions || offerData?.termsAndConditions || '';

    // Handle multiple images for carousel
    const offerImages = Array.isArray(offerData.OfferImages)
        ? offerData.OfferImages
        : Array.isArray(offerData.offerImages)
          ? offerData.offerImages
          : [offerData.OfferImages || offerData.offerImages].filter(Boolean);

    const hasMultipleImages = offerImages.length > 1;

    return (
        <>
            <RSModal
                show={show}
                handleClose={onHide}
                size="lg"
                header={offerDisplayName}
                className="offer-detail-modal"
                body={
                    <div className="p21">
                        {/* Content with padding */}
                        <div className="offer-modal-content">
                            <Row>
                                <Col lg={6}>
                                    {/* Banner Image / Carousel - Full Width */}
                                    <div className="offer-banner-wrapper">
                                        {hasMultipleImages ? (
                                            <Carousel
                                                className="preview-banner-carousel"
                                                interval={null}
                                                indicators={offerImages.length > 1}
                                                controls={offerImages.length > 1}
                                            >
                                                {offerImages.map((img, idx) => (
                                                    <Carousel.Item key={idx}>
                                                        <img
                                                            src={img}
                                                            alt={`${offerDisplayName} ${idx + 1}`}
                                                        />
                                                    </Carousel.Item>
                                                ))}
                                            </Carousel>
                                        ) : (
                                            <img src={offerImages[0]} alt={offerDisplayName} />
                                        )}
                                    </div>
                                </Col>
                                <Col lg={6}>
                                    {/* Offer Header */}
                                    <div className="offer-header-section">
                                        <h5 className="offer-main-title">{offerDisplayName}</h5>

                                        {/* Badges */}
                                        {Array.isArray(offerTags) ? (
                                            <div className="tags-container mb10 d-flex flex-wrap align-items-center gap-2">
                                                {offerTags.map((tag, tagIndex) => (
                                                    <Badge
                                                        key={tagIndex}
                                                        bg="tertiary-blue"
                                                        text="black"
                                                        className="offer-category-badge"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="tags-container mb10 d-flex flex-wrap align-items-center gap-2">
                                                <Badge
                                                    bg="tertiary-blue"
                                                    text="black"
                                                    className="offer-category-badge mb-2"
                                                >
                                                    {offerTags}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div
                                            className="offer-description-text"
                                            dangerouslySetInnerHTML={{ __html: offerDescription }}
                                        />
                                    </div>

                                    {/* Claim Button */}
                                    <div className="offer-claim-section">
                                        <RSPrimaryButton onClick={onClaimOffer}>
                                            {CLAIM_OFFER}
                                        </RSPrimaryButton>
                                    </div>
                                </Col>
                                <Col md={12} className="mt25">
                                    {/* Details Section */}
                                    <div className="offer-details-box">
                                        <h3 className="details-title">{DETAILS}</h3>
                                        <Row>
                                            <Col lg={3}>
                                                <div className="detail-item">
                                                    <span className="detail-label">{VALIDITY}</span>
                                                    <div className="detail-value">{getValidityDays(offerEndTime)}</div>
                                                </div>
                                            </Col>
                                            <Col lg={3}>
                                                <div className="detail-item">
                                                    <span className="detail-label">{MIN_SPEND}</span>
                                                    <div className="detail-value">{formatCurrency(minSpend)}</div>
                                                </div>
                                            </Col>
                                            <Col lg={3}>
                                                <div className="detail-item">
                                                    <span className="detail-label">{MAX_DISCOUNT}</span>
                                                    <div className="detail-value">{formatCurrency(maxDiscount)}</div>
                                                </div>
                                            </Col>
                                            <Col lg={3}>
                                                <div className="detail-item">
                                                    <span className="detail-label">{APPLICABLE_DAYS}</span>
                                                    <div className="detail-value">{getDayNames(applicableDays)}</div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="offer-terms-box">
                                        <h3 className="terms-title">{TERMSCONDITIONS}</h3>
                                        <div
                                            className="terms-content"
                                            dangerouslySetInnerHTML={{ __html: termsAndConditions }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                }
            ></RSModal>
        </>
    );
}

export default OfferDetailModal;
