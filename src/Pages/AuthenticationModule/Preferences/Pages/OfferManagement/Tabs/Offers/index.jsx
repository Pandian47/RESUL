import { thumps_up_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Carousel, Badge } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons/index.jsx';
import RSPageHeader from 'Components/RSPageHeader';
import { useForm } from 'react-hook-form';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import OfferDetailModal from './OfferDetailModal';
import {
    ALL_CATEGORIES,
    ALL_BRANDS,
    DISCOVER_AMAZING_OFFERS,
    SEARCH_OFFERS_BRANDS,
    CATEGORY,
    VIEW,
    CLAIM,
    NO_RECORDS_FOUND,
    CREDENTIALS,
    EMAIL_ID,
    ENTER_YOUR_EMAIL,
    MOBILE_NO,
    ENTER_YOUR_MOBILE_NUMBER,
    CANCEL,
    SUBMIT,
    CLAIM_OFFER,
    OFFER_WILL_BE_SENT_TO_YOUR,
    EMAIL_ID_AND_MOBILE_NO,
} from 'Constants/GlobalConstant/Placeholders';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import RSPager from 'Components/RSPager';
import { INITIAL_PAGE_CONFIG } from 'Components/RSPager/constant';
import { useDispatch, useSelector } from 'react-redux';
import { renderPublishedOffer } from 'Reducers/preferences/OfferManagements/request';
import { getSessionId } from 'Reducers/globalState/selector';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const Offers = () => {
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { control, watch } = useForm({
        defaultValues: {
            searchTerm: '',
            category: [],
            brand: [],
        },
    });
    const { control: credentialsControl, getValues } = useForm({
        defaultValues: {
            emailId: '',
            mobileNo: '',
        },
    });

    const [isViewOffer, setIsViewOffer] = useState(false);
    const [selectedOfferData, setSelectedOfferData] = useState(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submittedContact, setSubmittedContact] = useState('');
    const [pagerPageConfig, setPagerPageConfig] = useState(INITIAL_PAGE_CONFIG);
    const [pagedOffers, setPagedOffers] = useState([]);
    const [apiOffers, setApiOffers] = useState([]);

    const discoverOffersApi = usePreferencesSubPageApi({
        enabled: Boolean(clientId && userId && departmentId),
        mode: 'create',
        deps: [clientId, userId, departmentId],
        fetcher: async () => {
            const payload = { clientId, userId, departmentId };
            const res = await dispatch(renderPublishedOffer(payload, false));
            if (res?.status && Array.isArray(res?.data)) {
                setApiOffers(res.data);
            } else {
                setApiOffers([]);
            }
            return res;
        },
    });

    // Watch form values for filtering
    const searchTerm = watch('searchTerm');
    const selectedCategories = watch('category');
    const selectedBrands = watch('brand');

    // Helper function to strip HTML tags for plain text
    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const extractText = (value) => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (value && typeof value === 'object') {
            return value.label || value.text || value.value || value.name || '';
        }
        return '';
    };

    const normalizeOffer = (offer) => {
        const offerName = offer?.OfferDisplayName || offer?.offerDisplayName || offer?.OfferName || offer?.offerName || '';
        const rawDescription = offer?.OfferDescription || offer?.offerDescription || '';
        const rawCategory = offer?.CategoryName || offer?.categoryName || '';
        const rawSubCategory = offer?.SubCategoryName || offer?.subCategoryName || '';
        const rawBrand = offer?.BrandName || offer?.brandName || '';
        const rawImages = offer?.OfferImages || offer?.offerImages || offer?.offerPreviewImage || offer?.OfferPreviewImage || '';
        const tagsFromResponse = offer?.Tags || offer?.tags;
        const tags = Array.isArray(tagsFromResponse)
            ? tagsFromResponse
            : [rawCategory, rawSubCategory, rawBrand].filter(Boolean);

        return {
            ...offer,
            OfferID: offer?.OfferID || offer?.offerID || offer?.id,
            OfferDisplayName: offerName,
            OfferName: offer?.OfferName || offer?.offerName || offerName,
            OfferDescription: rawDescription,
            OfferImages: Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : [],
            CategoryName: rawCategory,
            SubCategoryName: rawSubCategory,
            BrandName: rawBrand,
            Tags: tags.length ? tags : ['N/A'],
        };
    };

    const sourceOffers = useMemo(() => (Array.isArray(apiOffers) ? apiOffers : []), [apiOffers]);
    const normalizedOffers = useMemo(() => sourceOffers.map(normalizeOffer), [sourceOffers]);

    const searchOptions = useMemo(() => {
        const set = new Set();
        normalizedOffers.forEach((offer) => {
            [offer.OfferDisplayName, offer.OfferName, offer.BrandName].forEach((value) => {
                const text = extractText(value).trim();
                if (text) set.add(text);
            });
        });
        return Array.from(set);
    }, [normalizedOffers]);

    const categoryOptions = useMemo(() => {
        const set = new Set([ALL_CATEGORIES]);
        normalizedOffers.forEach((offer) => {
            const category = extractText(offer.CategoryName).trim();
            const subCategory = extractText(offer.SubCategoryName).trim();
            if (category) set.add(category);
            if (subCategory) set.add(subCategory);
        });
        return Array.from(set);
    }, [normalizedOffers, ALL_CATEGORIES]);

    const brandOptions = useMemo(() => {
        const set = new Set([ALL_BRANDS]);
        normalizedOffers.forEach((offer) => {
            const brand = extractText(offer.BrandName).trim();
            if (brand) set.add(brand);
        });
        return Array.from(set);
    }, [normalizedOffers, ALL_BRANDS]);

    // Filter offers based on search, category, and brand
    const filteredOffers = useMemo(() => {
        return normalizedOffers.filter((offer) => {
            // Search filter
            if (Array.isArray(searchTerm) && searchTerm.length > 0) {
                const searchList = searchTerm.map((term) => extractText(term).toLowerCase()).filter(Boolean);

                const offerText = `${offer.OfferDisplayName} ${offer.OfferName} ${offer.BrandName}`.toLowerCase();

                // Check if ANY search keyword matches
                const matchesSearch = searchList.some((keyword) => offerText.includes(keyword));

                if (!matchesSearch) return false;
            }

            // Category filter
            if (selectedCategories?.length > 0) {
                const selectedCategoryValues = selectedCategories.map(extractText).filter(Boolean);
                const hasAllCategories = selectedCategoryValues.includes(ALL_CATEGORIES);
                if (!hasAllCategories) {
                    const matchesCategory = selectedCategoryValues.some(
                        (cat) => offer.CategoryName === cat || offer.SubCategoryName === cat,
                    );
                    if (!matchesCategory) return false;
                }
            }

            // Brand filter
            if (selectedBrands?.length > 0) {
                const selectedBrandValues = selectedBrands.map(extractText).filter(Boolean);
                const hasAllBrands = selectedBrandValues.includes(ALL_BRANDS);
                if (!hasAllBrands) {
                    if (!selectedBrandValues.includes(offer.BrandName)) return false;
                }
            }

            return true;
        });
    }, [normalizedOffers, searchTerm, selectedCategories, selectedBrands]);

    useEffect(() => {
        const take = pagerPageConfig?.take || INITIAL_PAGE_CONFIG.take;
        setPagedOffers(filteredOffers.slice(0, take));
        setPagerPageConfig((prev) => ({
            ...prev,
            skip: 0,
            take,
        }));
    }, [searchTerm, selectedCategories, selectedBrands, filteredOffers.length]);

    // Handle view offer click
    const handleViewOffer = (offer) => {
        setSelectedOfferData(offer);
        setIsViewOffer(true);
    };

    // Handle claim offer click
    const handleClaimOffer = () => {
        setIsViewOffer(false); // Close offer detail modal
        setShowCredentials(true); // Open credentials modal
    };

    // Handle credentials submit
    const handleCredentialsSubmit = () => {
        const { emailId, mobileNo } = getValues();
        const contact = emailId || mobileNo;
        setSubmittedContact(contact);
        setShowCredentials(false);
        setShowSuccess(true);
    };

    // Handle credentials cancel
    const handleCredentialsCancel = () => {
        setShowCredentials(false);
        setIsViewOffer(true);
    };

    // Get images array from offer
    const getOfferImages = (offer) => {
        const images = Array.isArray(offer.OfferImages) ? offer.OfferImages : [offer.OfferImages];
        return images.filter(Boolean);
    };

    // Check if offer has multiple images
    const hasMultipleImages = (offer) => {
        const images = getOfferImages(offer);
        return images.length > 1;
    };

    return (
        <div className="page-content-holder">
            <RSPageHeader
                title={DISCOVER_AMAZING_OFFERS}
                rightCommonMenus={false}
                isBack
                backPath={`/preferences/offer-management`}
            />
            <Container fluid>
                <div className="page-content">
                    <Container className=" px0">
                        <div className="offers-page-wrapper box-design no-box-shadow mt21">
                            <div className="offers-container">
                                <PreferencesSubPageSkeletonGate
                                    variant={PREFERENCES_SUBPAGE_VARIANT.OFFER_DISCOVER}
                                    isLoading={discoverOffersApi.isPageLoading}
                                >
                                {/* Search and Filter Section */}
                                <Row className="align-items-center justify-content-between offers-search-filters form-group">
                                    <Col>
                                        <RSMultiSelect
                                            control={control}
                                            label={SEARCH_OFFERS_BRANDS}
                                            name="searchTerm"
                                            data={searchOptions}
                                            //  filterable={true}
                                        />
                                    </Col>
                                    <Col>
                                        <RSMultiSelect
                                            control={control}
                                            label={CATEGORY}
                                            name="category"
                                            data={categoryOptions}
                                        />
                                    </Col>
                                    {/* <Col>
                                        <RSMultiSelect
                                            control={control}
                                            label={BRAND}
                                            name="brand"
                                            data={brandOptions}
                                        />
                                    </Col> */}
                                </Row>

                                <div className="offerWrapper d-flex flex-wrap">
                                    {pagedOffers.map((offer, index) => (
                                        <Card key={offer.OfferID || index} className="offer-card  ">
                                                    {/* Offer Image / Carousel */}
                                                    <div className="offer-image-wrapper">
                                                        {hasMultipleImages(offer) ? (
                                                            <Carousel
                                                                className="preview-banner-carousel"
                                                                interval={null}
                                                                indicators={getOfferImages(offer).length > 1}
                                                                controls={getOfferImages(offer).length > 1}
                                                            >
                                                                {getOfferImages(offer).map((img, idx) => (
                                                                    <Carousel.Item key={idx}>
                                                                        <img
                                                                            src={img}
                                                                            alt={`${offer.OfferDisplayName} ${idx + 1}`}
                                                                        />
                                                                    </Carousel.Item>
                                                                ))}
                                                            </Carousel>
                                                        ) : (
                                                            <img
                                                                src={getOfferImages(offer)[0]}
                                                                alt={offer.OfferDisplayName}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Card Body */}
                                                    <Card.Body className="offer-card-body">
                                                        <div className="offer-card-body-inner">
                                                            {/* Offer Title */}
                                                            <h3 className="offer-title">{offer.OfferDisplayName}</h3>

                                                            {/* Category Label */}
                                                            {Array.isArray(offer.Tags) ? (
                                                                <div className="tags-container mb10 d-flex flex-wrap align-items-center gap-2">
                                                                    {offer.Tags.map((tag, tagIndex) => (
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
                                                                        {offer.Tags}
                                                                    </Badge>
                                                                </div>
                                                            )}

                                                            {/* Offer Description */}
                                                            <p className="offer-description">
                                                                {stripHtml(offer.OfferDescription)}
                                                            </p>
                                                        </div>
                                                        {/* View Offer Button */}
                                                        <div className="offer-card-footer d-flex align-items-center justify-content-end gap-2">
                                                            <RSPrimaryButton onClick={() => handleViewOffer(offer)}>
                                                                {VIEW}
                                                            </RSPrimaryButton>
                                                            <RSPrimaryButton onClick={handleClaimOffer}>
                                                                {CLAIM}
                                                            </RSPrimaryButton>
                                                        </div>
                                                    </Card.Body>
                                        </Card>
                                    ))}
                                </div>

                                {filteredOffers.length === 0 && (
                                    <RSSkeletonTable
                                        message={NO_RECORDS_FOUND}
                                        text={NO_RECORDS_FOUND}
                                        count={5}
                                        isCustombox
                                    />
                                )}

                                {filteredOffers.length > pagerPageConfig.take && (
                                    <Row className="mt10">
                                        <RSPager
                                            data={filteredOffers}
                                            config={pagerPageConfig}
                                            change={(data, skip, take) => {
                                                setPagedOffers(data);
                                                setPagerPageConfig((prev) => ({ ...prev, skip, take }));
                                            }}
                                        />
                                    </Row>
                                )}
                                </PreferencesSubPageSkeletonGate>
                            </div>

                            {/* Offer Detail Modal */}
                            <OfferDetailModal
                                show={isViewOffer}
                                onHide={() => setIsViewOffer(false)}
                                offerData={selectedOfferData}
                                onClaimOffer={handleClaimOffer}
                            />

                            {/* Credentials Modal */}
                            <RSModal
                                show={showCredentials}
                                handleClose={() => setShowCredentials(false)}
                                size="md"
                                header={CREDENTIALS}
                                body={
                                    <div>
                                        <div className="form-group">
                                            <RSInput
                                                control={credentialsControl}
                                                name="emailId"
                                                label={EMAIL_ID}
                                                placeholder={ENTER_YOUR_EMAIL}
                                            />
                                        </div>
                                        <div className="form-group mb0">
                                            <RSInput
                                                control={credentialsControl}
                                                name="mobileNo"
                                                label={MOBILE_NO}
                                                placeholder={ENTER_YOUR_MOBILE_NUMBER}
                                            />
                                        </div>
                                    </div>
                                }
                                footer={
                                    <div className="d-flex justify-content-end">
                                        <RSSecondaryButton onClick={handleCredentialsCancel}>
                                            {CANCEL}
                                        </RSSecondaryButton>
                                        <RSPrimaryButton onClick={handleCredentialsSubmit}>
                                            {SUBMIT}
                                        </RSPrimaryButton>
                                    </div>
                                }
                            />

                            {/* Success Modal */}
                            <RSModal
                                show={showSuccess}
                                handleClose={() => setShowSuccess(false)}
                                header={CLAIM_OFFER}
                                size="md"
                                body={
                                    <div className="d-flex flex-column align-items-center">
                                        <i
                                            className={`${thumps_up_xlarge} fs75 cursor-normal color-primary-green`}
                                        ></i>
                                        <div className="mt10">
                                            {OFFER_WILL_BE_SENT_TO_YOUR}{' '}
                                            {submittedContact ? submittedContact : EMAIL_ID_AND_MOBILE_NO}
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </Container>
                </div>
            </Container>
        </div>
    );
};

export default Offers;
