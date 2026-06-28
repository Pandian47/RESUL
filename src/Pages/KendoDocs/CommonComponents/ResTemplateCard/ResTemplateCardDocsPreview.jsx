import { COMMUNICATION_TYPE, CONVERSION, DELIVERY_METHOD, ENGAGEMENT, REACH, TOTAL_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useState } from 'react';
import { Row } from 'react-bootstrap';

import { EmailPreview, mdcTemplate1, mdcTemplate2, mdcTemplate3, TempImage1, TemplateBlank1, AnnotationPreview } from 'Assets/Images';
import {
    TEMPLATE_CARD_CARDS_PER_ROW_BY_COL,
    TEMPLATE_CARD_HEIGHT_BY_COL,
    mapCommunicationGalleryItemToTemplateCardProps,
} from 'CommonComponents/ResTemplateCard/resTemplateCardUtils';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import ResTemplateCard from 'CommonComponents/ResTemplateCard';
import { ResTemplateCardBody } from 'CommonComponents/ResTemplateCard/ResTemplateCardPreview';
import SkeletonGalleryCard from 'Components/Skeleton/Components/SkeletonGalleryCard.jsx';

/** Minimal email HTML for iframe preview demos — no external assets. */
const DEMO_EMAIL_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;font-family:sans-serif;background:#f4f7fb">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="280" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
<tr><td style="background:#1a3c6b;color:#fff;padding:16px;font-size:16px;font-weight:600">Summer Sale</td></tr>
<tr><td style="padding:20px;color:#333;font-size:13px;line-height:1.5">Refer friends and earn rewards on every purchase this season.</td></tr>
<tr><td style="padding:0 20px 20px"><a style="display:inline-block;background:#2d6cdf;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:13px">Shop now</a></td></tr>
</table></td></tr></table></body></html>`;

const DEMO_PUSH_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;font-family:sans-serif;background:#111827">
<div style="max-width:280px;margin:16px auto;background:#1f2937;border-radius:12px;padding:16px;color:#f9fafb">
<div style="font-size:11px;color:#9ca3af;margin-bottom:6px">YourBrand · now</div>
<div style="font-size:15px;font-weight:600;margin-bottom:8px">Cart waiting for you</div>
<div style="font-size:13px;line-height:1.5;color:#d1d5db">Complete checkout in the next 2 hours and save 15% on your order.</div>
</div></body></html>`;

const DEMO_MENU_ITEMS = ['Edit', 'Duplicate', 'Preview', 'Rename', 'Delete'];

const DEMO_CAROUSEL_TEXT_STYLE = 'margin:0;font-size:13px;line-height:1.5;color:#333';

/** Carousel slides — image + text per slide (Communication listing gallery pattern). */
const DEMO_CAROUSEL_SLIDES = [
    {
        key: 'carousel-scenery',
        imageSrc: TempImage1,
        imageAlt: 'Landscape scenery',
        text: `<p style="${DEMO_CAROUSEL_TEXT_STYLE}">A beautiful scenery has the power to calm the mind and refresh the soul. Rolling hills and golden light invite your audience to pause and explore.</p>`,
    },
    {
        key: 'carousel-mdc-1',
        imageSrc: mdcTemplate1,
        imageAlt: 'MDC journey canvas — acquisition',
        text: `<p style="${DEMO_CAROUSEL_TEXT_STYLE}">Acquisition journey canvas — entry paths, goals, and channel splits for multi-touch campaigns.</p>`,
    },
    {
        key: 'carousel-mdc-2',
        imageSrc: mdcTemplate2,
        imageAlt: 'MDC journey canvas — nurture',
        text: `<p style="${DEMO_CAROUSEL_TEXT_STYLE}">Nurture workflow — reminder levels and branching logic across email and mobile.</p>`,
    },
    {
        key: 'carousel-email',
        imageSrc: EmailPreview,
        imageAlt: 'Email hero layout',
        text: `<p style="${DEMO_CAROUSEL_TEXT_STYLE}">Product showcase layout with hero imagery and a clear call to action for seasonal campaigns.</p>`,
    },
];

const DEMO_CAROUSEL_SLIDES_SHORT = [
    {
        key: 'carousel-short-blank',
        imageSrc: TemplateBlank1,
        imageAlt: 'Template layout A',
        text: `<p style="${DEMO_CAROUSEL_TEXT_STYLE}">First touch — welcome message with brand imagery and a short value proposition.</p>`,
    },
    {
        key: 'carousel-short-mdc',
        imageSrc: mdcTemplate3,
        imageAlt: 'MDC journey canvas — retention',
        text: `<p style="${DEMO_CAROUSEL_TEXT_STYLE}">Retention path — follow-up reminder with supporting journey visual.</p>`,
    },
    {
        key: 'carousel-short-annotation',
        imageSrc: AnnotationPreview,
        imageAlt: 'Mobile annotation preview',
        text: `<p style="${DEMO_CAROUSEL_TEXT_STYLE}">Mobile push preview — compact layout for notification-style creatives.</p>`,
    },
];

const DEMO_GALLERY_INFO = {
    topItems: [
        { label: DELIVERY_METHOD, value: 'Multi dimension' },
        { label: COMMUNICATION_TYPE, value: 'Greetings' },
    ],
    metrics: [
        { label: TOTAL_AUDIENCE, value: 'NA' },
        { label: REACH, value: 'NA' },
        { label: ENGAGEMENT, value: 'NA' },
        { label: CONVERSION, value: 'NA' },
    ],
};

/** Tiny valid JPEG base64 — same shape as listing API `contentThumbnail` for web push. */
const API_MOCK_MINI_JPEG_B64 =
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

/**
 * Communication listing gallery API shapes — web push (channelId 8) and WhatsApp (channelId 21).
 * `mapCommunicationGalleryItemToTemplateCardProps` binds image base64, CDN URLs, and plain text bodies.
 */
const API_MOCK_COMMUNICATION_GALLERY = {
    webPush: [
        {
            analyticsTypeIs: [6, 16],
            attributeName: 'New product launch',
            campaignId: 47948,
            campaignName: 'Test_09876y',
            campaigns: [
                {
                    blastScheduleGuid: '0019a0ae-f062-4a8c-a344-ded204f0339b',
                    campaignGuid: '4a2275d9-23bd-4ede-8d8f-6a9996be7eff',
                    campaigncontent: 'sdds',
                    contentThumbnail: API_MOCK_MINI_JPEG_B64,
                    imagePath: '',
                    isCarousel: false,
                },
            ],
            channelId: 8,
            createdDate: '2026-06-18',
            deliveryMethod: 'S',
            statusId: 7,
        },
        {
            analyticsTypeIs: [6, 16],
            attributeName: 'Brand Awareness',
            campaignId: 47758,
            campaignName: 'RR Push Check',
            campaigns: [
                {
                    blastScheduleGuid: 'b8e48c2a-4912-44a9-9be6-f36d9dacbfe9',
                    campaignGuid: 'c4ac1893-1b3a-4417-ba3b-ae4c157f11cd',
                    campaigncontent:
                        'RR Web push vision bank — complete checkout in the next 2 hours and save 15% on your order.',
                    contentThumbnail: API_MOCK_MINI_JPEG_B64,
                    imagePath: '',
                    isCarousel: false,
                },
            ],
            channelId: 8,
            createdDate: '2026-06-17',
            deliveryMethod: 'S',
            statusId: 5,
        },
    ],
    whatsApp: [
        {
            analyticsTypeIs: [6],
            attributeName: 'Brand Awareness',
            campaignId: 47968,
            campaignName: 'RR WhatsApp',
            campaigns: [
                {
                    blastScheduleGuid: '0b668385-d84d-46cc-81de-044f4394d7e2',
                    campaignGuid: 'b5b8f0d5-edf4-449a-80b1-18209a09d22c',
                    campaigncontent:
                        'Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.',
                    contentThumbnail:
                        'Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.',
                    imagePath: '',
                    isCarousel: false,
                },
            ],
            channelId: 21,
            createdDate: '2026-06-18',
            deliveryMethod: 'S',
            statusId: 52,
        },
        {
            analyticsTypeIs: [],
            attributeName: 'Brand Awareness',
            campaignId: 47831,
            campaignName: 'MDC SS June 17 2026',
            campaigns: [
                {
                    blastScheduleGuid: 'e5e5fc96-bd7a-4b22-a4ac-205ced66d209',
                    campaignGuid: '1ed894f6-1047-40d5-b36f-c021ac4cacfa',
                    campaigncontent:
                        'Hello {{[[Name]]}},\n\nEmpower your business growth with Marketing Star. Create, manage, and analyze Email, SMS, WhatsApp, and QR campaigns from one unified interface.\n\nGet started today and simplify your marketing efforts.',
                    contentThumbnail:
                        'Hello {{[[Name]]}},\n\nEmpower your business growth with Marketing Star. Create, manage, and analyze Email, SMS, WhatsApp, and QR campaigns from one unified interface.\n\nGet started today and simplify your marketing efforts.',
                    imagePath:
                        'https://cdn.resulticks.com/Uploads/Campaigns/whatsapp/92560e39-b94e-48f4-a69f-9c1380dba7e8/Facebook_5.jpg',
                    isCarousel: false,
                },
            ],
            channelId: 21,
            createdDate: '2026-06-17',
            deliveryMethod: 'M',
            statusId: 5,
        },
        {
            analyticsTypeIs: [6],
            attributeName: 'Brand Awareness',
            campaignId: 47814,
            campaignName: 'SDC WA CGGT Multi List Run Jun 17',
            campaigns: [
                {
                    blastScheduleGuid: '77775264-996f-4100-96a8-ff0231684013',
                    campaignGuid: '560ff924-7172-4911-94fe-ca19e4fbc547',
                    campaigncontent:
                        'Deliver personalized campaigns across every channel with Resulticks’ AI-powered platform.\nReal-time analytics empower you to track, measure, and optimize every customer interaction.',
                    contentThumbnail:
                        'Deliver personalized campaigns across every channel with Resulticks’ AI-powered platform.\nReal-time analytics empower you to track, measure, and optimize every customer interaction.',
                    imagePath:
                        'https://cdn.resulticks.com/Uploads/Campaigns/whatsapp/e6a959a3-0c36-469b-883f-21ec283eb6f7/48ae8674b8581a9042e159a3011ed12c.gif',
                    isCarousel: false,
                },
            ],
            channelId: 21,
            createdDate: '2026-06-17',
            deliveryMethod: 'S',
            statusId: 5,
        },
    ],
};

const GALLERY_ROW_COL3 = [
    {
        key: 'gallery-email-used',
        templateName: 'Welcome email – onboarding series',
        statusClass: 'used',
        createdDate: 'May 19, 2026',
        html: DEMO_EMAIL_HTML,
        previewMode: 'email',
    },
    {
        key: 'gallery-email-notused',
        templateName: 'Push notification – cart abandon',
        statusClass: 'notused',
        createdDate: 'Apr 02, 2026',
        html: DEMO_PUSH_HTML,
        previewMode: 'push',
    },
    {
        key: 'gallery-image-mdc',
        templateName: 'MDC journey – multi-channel workflow',
        statusClass: 'drafted',
        createdDate: 'Mar 14, 2026',
        carouselSlides: DEMO_CAROUSEL_SLIDES_SHORT,
    },
    {
        key: 'gallery-image-email',
        templateName: 'Email layout – product showcase',
        statusClass: 'scheduled',
        createdDate: 'Feb 28, 2026',
        thumbnailPath: EmailPreview,
        previewMode: 'push',
    },
];

const GALLERY_ROW_COL4 = [
    {
        key: 'gallery-col4-email',
        templateName: 'Newsletter – Q2 product launch',
        statusClass: 'used',
        createdDate: 'Jun 01, 2026',
        html: DEMO_EMAIL_HTML,
        previewMode: 'email',
    },
    {
        key: 'gallery-col4-mdc',
        templateName: 'MDC canvas – acquisition journey',
        statusClass: 'inprogress',
        createdDate: 'May 22, 2026',
        thumbnailPath: mdcTemplate1,
        previewMode: 'push',
    },
    {
        key: 'gallery-col4-image',
        templateName: 'Email preview – hero banner layout',
        statusClass: 'completed',
        createdDate: 'May 10, 2026',
        thumbnailPath: EmailPreview,
        previewMode: 'push',
    },
];

const getDemoActionMessage = (action, templateName) => {
    const messages = {
        Edit: `Opening the template editor for "${templateName}". In the app this navigates to the builder with the selected template loaded.`,
        Duplicate: `"${templateName}" would be duplicated as a new draft. The copy keeps the same layout and can be renamed before saving.`,
        Preview: `Full-screen preview for "${templateName}". This demo uses the inline iframe thumbnail in the card body.`,
        Rename: `Rename dialog would open for "${templateName}". Enter a new name and save to update the gallery list.`,
        Delete: `"${templateName}" would be permanently removed after confirmation. This action cannot be undone in production.`,
    };

    return messages[action] || `Action "${action}" selected for "${templateName}".`;
};

const PreviewSection = ({ label, description, children }) => (
    <div className="mb40">
        <div
            className="d-flex align-items-baseline gap-3 mb10 pb8"
            style={{ borderBottom: '2px solid #e3eaef' }}
        >
            <h4 className="m0 font-sm" style={{ fontWeight: 700, color: '#1a3c6b' }}>
                {label}
            </h4>
            {description && (
                <span className="font-xsm color-primary-grey">{description}</span>
            )}
        </div>
        <Row className="g-3">{children}</Row>
    </div>
);

const TemplateCardMenuActions = ({ templateName, onSelect }) => (
    <div className="res-template-card__header-actions">
        <BootstrapDropdown
            data={DEMO_MENU_ITEMS}
            flatIcon
            alignRight
            showUpdate={false}
            className="no_caret"
            isScroll={false}
            defaultItem={
                <i
                    className={`${menu_dot_medium} color-primary-blue icon-md`}
                    aria-label={`Actions for ${templateName}`}
                />
            }
            onSelect={(action) => onSelect(action, templateName)}
        />
    </div>
);

const GalleryDemoCard = ({ col, item, onMenuSelect }) => (
    <ResTemplateCard
        col={col}
        variant="gallery"
        statusClass={item.statusClass}
        headerMeta={
            <>
                <span className="rctcb-by-text">Created on : </span>
                <span className="rct-date">{item.createdDate}</span>
            </>
        }
        moreIcon={
            <TemplateCardMenuActions templateName={item.templateName} onSelect={onMenuSelect} />
        }
        title={item.templateName}
        bodyContent={
            item.carouselSlides ? (
                <ResTemplateCardBody
                    contentVariant="carousel"
                    slides={item.carouselSlides}
                    templateName={item.templateName}
                />
            ) : item.html ? (
                <ResTemplateCardBody
                    contentVariant="iframe"
                    html={item.html}
                    previewMode={item.previewMode}
                    templateName={item.templateName}
                />
            ) : (
                <ResTemplateCardBody
                    contentVariant="image"
                    thumbnailPath={item.thumbnailPath}
                    previewMode={item.previewMode}
                    templateName={item.templateName}
                />
            )
        }
        info={item.info}
    />
);

/** Maps Communication listing API row → ResTemplateCard (gallery variant). */
const CommunicationGalleryDemoCard = ({ listItem, col = 3, showInfo = true, onMenuSelect }) => {
    const cardProps = mapCommunicationGalleryItemToTemplateCardProps(listItem, {
        col,
        variant: 'gallery',
        showInfo,
    });

    return (
        <ResTemplateCard
            {...cardProps}
            createdDate={cardProps.createdDate}
            moreIcon={
                <TemplateCardMenuActions
                    templateName={cardProps.title}
                    onSelect={onMenuSelect}
                />
            }
            bodyContent={<ResTemplateCardBody {...cardProps.bodyConfig} />}
        />
    );
};

/**
 * ResTemplateCardDocsPreview — Kendo Docs live preview for all card variants.
 * Uses mock data only; no Redux or API calls.
 */
const ResTemplateCardDocsPreview = () => {
    const [modalState, setModalState] = useState({
        show: false,
        header: '',
        body: '',
    });

    const handleMenuSelect = useCallback((action, templateName) => {
        setModalState({
            show: true,
            header: action,
            body: getDemoActionMessage(action, templateName),
        });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalState((prev) => ({ ...prev, show: false }));
    }, []);

    return (
        <div className="res-template-card-docs-preview" style={{ padding: '8px 0' }}>
            <p className="font-sm color-primary-grey mb25">
                Shared template/gallery card shell used in Preferences template galleries and Communication
                template pickers. Heights are set by the Bootstrap <code>col</code> prop — col 3 →{' '}
                {TEMPLATE_CARD_HEIGHT_BY_COL[3]}px ({TEMPLATE_CARD_CARDS_PER_ROW_BY_COL[3]} per row), col 4 →{' '}
                {TEMPLATE_CARD_HEIGHT_BY_COL[4]}px ({TEMPLATE_CARD_CARDS_PER_ROW_BY_COL[4]} per row), col 6 →{' '}
                {TEMPLATE_CARD_HEIGHT_BY_COL[6]}px ({TEMPLATE_CARD_CARDS_PER_ROW_BY_COL[6]} per row). Image
                previews load from <code>Assets/Images</code>.
            </p>

            <PreviewSection
                label="Gallery"
                description={`variant="gallery" · col={3} · ${TEMPLATE_CARD_CARDS_PER_ROW_BY_COL[3]} cards/row (${TEMPLATE_CARD_HEIGHT_BY_COL[3]}px) · HTML + images`}
            >
                {GALLERY_ROW_COL3.map((item) => (
                    <GalleryDemoCard
                        key={item.key}
                        col={3}
                        item={item}
                        onMenuSelect={handleMenuSelect}
                    />
                ))}
            </PreviewSection>

            <PreviewSection
                label="Gallery (wider cards)"
                description={`variant="gallery" · col={4} · ${TEMPLATE_CARD_CARDS_PER_ROW_BY_COL[4]} cards/row (${TEMPLATE_CARD_HEIGHT_BY_COL[4]}px)`}
            >
                {GALLERY_ROW_COL4.map((item) => (
                    <GalleryDemoCard
                        key={item.key}
                        col={4}
                        item={item}
                        onMenuSelect={handleMenuSelect}
                    />
                ))}
            </PreviewSection>

            <PreviewSection
                label="Gallery with carousel"
                description='body · ResTemplateCardBody contentVariant="carousel" · image + text per slide'
            >
                <ResTemplateCard
                    col={3}
                    variant="gallery"
                    statusClass="alerted"
                    headerMeta={
                        <>
                            <span className="rctcb-by-text">Created on : </span>
                            <span className="rct-date">18-06-2026</span>
                        </>
                    }
                    moreIcon={
                        <TemplateCardMenuActions
                            templateName="MDC Reminder Level Flow checklist"
                            onSelect={handleMenuSelect}
                        />
                    }
                    title="MDC Reminder Level Flow checklist"
                    bodyContent={
                        <ResTemplateCardBody
                            contentVariant="carousel"
                            slides={DEMO_CAROUSEL_SLIDES}
                            templateName="MDC Reminder Level Flow checklist"
                        />
                    }
                    info={DEMO_GALLERY_INFO}
                />
                <ResTemplateCard
                    col={3}
                    variant="gallery"
                    statusClass="inprogress"
                    headerMeta={
                        <>
                            <span className="rctcb-by-text">Created on : </span>
                            <span className="rct-date">12-06-2026</span>
                        </>
                    }
                    moreIcon={
                        <TemplateCardMenuActions
                            templateName="Onboarding series – multi-slide preview"
                            onSelect={handleMenuSelect}
                        />
                    }
                    title="Onboarding series – multi-slide preview"
                    bodyContent={
                        <ResTemplateCardBody
                            contentVariant="carousel"
                            slides={DEMO_CAROUSEL_SLIDES_SHORT}
                            templateName="Onboarding series – multi-slide preview"
                        />
                    }
                />
            </PreviewSection>

            <PreviewSection
                label="Gallery with info"
                description='info prop · footer info icon · rs-gallery-popup overlay'
            >
                <ResTemplateCard
                    col={3}
                    variant="gallery"
                    statusClass="scheduled"
                    headerMeta={
                        <>
                            <span className="rctcb-by-text">Created on : </span>
                            <span className="rct-date">01-06-2026</span>
                        </>
                    }
                    moreIcon={
                        <TemplateCardMenuActions
                            templateName="Summer campaign – metrics panel"
                            onSelect={handleMenuSelect}
                        />
                    }
                    title="Summer campaign – metrics panel"
                    bodyContent={
                        <ResTemplateCardBody
                            contentVariant="carousel"
                            slides={DEMO_CAROUSEL_SLIDES_SHORT}
                            templateName="Summer campaign – metrics panel"
                        />
                    }
                    info={DEMO_GALLERY_INFO}
                />
            </PreviewSection>

            <PreviewSection
                label="Communication listing API"
                description="mapCommunicationGalleryItemToTemplateCardProps · web push base64 thumbnail + bound text · WhatsApp text-only · imagePath URL + body"
            >
                {API_MOCK_COMMUNICATION_GALLERY.webPush.map((listItem) => (
                    <CommunicationGalleryDemoCard
                        key={listItem.campaignId}
                        col={3}
                        listItem={listItem}
                        onMenuSelect={handleMenuSelect}
                    />
                ))}
                {API_MOCK_COMMUNICATION_GALLERY.whatsApp.map((listItem) => (
                    <CommunicationGalleryDemoCard
                        key={listItem.campaignId}
                        col={3}
                        listItem={listItem}
                        onMenuSelect={handleMenuSelect}
                    />
                ))}
            </PreviewSection>

            <PreviewSection
                label="Communication"
                description='variant="communication" · hover overlay · Select action · HTML + image preview'
            >
                <ResTemplateCard
                    col={3}
                    variant="communication"
                    from="communication"
                    headerMeta={
                        <span className="rctcb-by-text">
                            Created on: <span className="rct-date">Jun 01, 2026</span>
                        </span>
                    }
                    moreIcon={
                        <TemplateCardMenuActions
                            templateName="Newsletter – Q2 product launch"
                            onSelect={handleMenuSelect}
                        />
                    }
                    title="Newsletter – Q2 product launch"
                    showOverlay
                    actionButtons={
                        <div className="button" role="button" tabIndex={0}>
                            Select
                        </div>
                    }
                    bodyContent={
                        <ResTemplateCardBody
                            contentVariant="iframe"
                            html={DEMO_EMAIL_HTML}
                            previewMode="communication"
                            templateName="Newsletter – Q2 product launch"
                            communicationScale
                        />
                    }
                />
                <ResTemplateCard
                    col={3}
                    variant="communication"
                    from="offer"
                    className="offer"
                    headerMeta={
                        <span className="rctcb-by-text">
                            Created on: <span className="rct-date">May 10, 2026</span>
                        </span>
                    }
                    moreIcon={
                        <TemplateCardMenuActions
                            templateName="MDC journey – landing goal path"
                            onSelect={handleMenuSelect}
                        />
                    }
                    title="MDC journey – landing goal path"
                    showOverlay
                    actionButtons={
                        <div className="button" role="button" tabIndex={0}>
                            Select
                        </div>
                    }
                    bodyContent={
                        <ResTemplateCardBody
                            contentVariant="carousel"
                            slides={DEMO_CAROUSEL_SLIDES_SHORT}
                            templateName="MDC journey – landing goal path"
                        />
                    }
                />
            </PreviewSection>

            <PreviewSection
                label="Skeleton"
                description="SkeletonGalleryCard · col={3} → 300px · 4-column row · loading shimmer · centered empty state"
            >
                <SkeletonGalleryCard col={3} isLoading hideBottomAccent />
                <SkeletonGalleryCard col={3} isLoading hideBottomAccent />
                <SkeletonGalleryCard col={3} isLoading hideBottomAccent />
                <SkeletonGalleryCard
                    col={3}
                    isLoading={false}
                    isNoDataAvailable
                    hideBottomAccent
                />
            </PreviewSection>

            <div
                style={{
                    marginTop: 8,
                    border: '1px solid #e3eaef',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        background: '#f5f8fc',
                        padding: '10px 16px',
                        borderBottom: '1px solid #e3eaef',
                    }}
                >
                    <strong className="font-sm" style={{ color: '#1a3c6b' }}>
                        Variant summary
                    </strong>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: 12,
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#f5f8fc' }}>
                                {['Variant', 'Key props', 'Used in'].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: '8px 12px',
                                            textAlign: 'left',
                                            borderBottom: '1px solid #e3eaef',
                                            color: '#1a3c6b',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                [
                                    'gallery',
                                    'col, statusClass, bodyContent, headerMeta, moreIcon, title, info',
                                    'EmailBuilder, PushBuilder, Communication listing gallery',
                                ],
                                [
                                    'gallery (API)',
                                    'mapCommunicationGalleryItemToTemplateCardProps → bodyConfig for ResTemplateCardBody',
                                    'Communication listing — web push, WhatsApp text/image/carousel',
                                ],
                                [
                                    'communication',
                                    'from, showOverlay, actionButtons, bodyContent',
                                    'Communication creation — template picker',
                                ],
                                [
                                    'skeleton',
                                    `col (${Object.entries(TEMPLATE_CARD_HEIGHT_BY_COL)
                                        .map(([c, h]) => `${c}→${h}px`)
                                        .join(', ')}), isLoading, isNoDataAvailable`,
                                    'SkeletonGalleryCard, PreferencesSubPageRouteSkeleton, gallery loading rows',
                                ],
                            ].map(([variant, props, usedIn]) => (
                                <tr key={variant} style={{ borderBottom: '1px solid #f0f3f7' }}>
                                    <td style={{ padding: '7px 12px', fontWeight: 600, background: '#fafcff' }}>
                                        {variant}
                                    </td>
                                    <td style={{ padding: '7px 12px', color: '#444' }}>{props}</td>
                                    <td style={{ padding: '7px 12px', color: '#555' }}>{usedIn}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <RSModal
                show={modalState.show}
                size="md"
                header={modalState.header}
                handleClose={handleCloseModal}
                body={
                    <p className="font-sm color-primary-grey m0 lh-base">{modalState.body}</p>
                }
                footer={<RSPrimaryButton onClick={handleCloseModal}>OK</RSPrimaryButton>}
            />
        </div>
    );
};

export default ResTemplateCardDocsPreview;
