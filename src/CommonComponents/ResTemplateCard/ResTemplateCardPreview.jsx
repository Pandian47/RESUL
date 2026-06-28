import { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Carousel } from 'react-bootstrap';

import {
    injectPreviewCss,
    isHtmlContent,
    parseStringifiedContent,
    resolveTemplateThumbnailSrc,
    TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD,
    formatGalleryTextHtml,
} from './resTemplateCardUtils';

const CarouselSlideContent = ({ slide, templateName, slideIndex }) => {
    const imgRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    const htmlContent = slide.html && isHtmlContent(slide.html) ? slide.html : '';
    const imageSrc = slide.imageSrc || '';
    const textContent = slide.text || '';

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return undefined;

        const checkImageHeight = () => {
            const imgHeight = img.naturalHeight || img.offsetHeight;
            setShouldScroll(imgHeight >= TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD);
        };

        img.addEventListener('load', checkImageHeight);
        if (img.complete) checkImageHeight();

        return () => img.removeEventListener('load', checkImageHeight);
    }, [imageSrc]);

    if (htmlContent) {
        return (
            <div className="res-template-card__carousel-slide res-template-card__carousel-slide--html">
                <div className="res-template-card__preview-scroll gl-img-scroll-container">
                    <div className="res-template-card__img gl-img iframe-container non-scrollable">
                        <iframe
                            title={`${templateName || 'template'}-slide-${slideIndex}`}
                            srcDoc={injectPreviewCss(htmlContent, slide.previewMode || 'email')}
                            className="res-template-card__preview-iframe email-preview-iframe"
                            tabIndex={-1}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="res-template-card__carousel-slide">
            {imageSrc && (
                <div
                    className={[
                        'res-template-card__carousel-slide-image',
                        'res-template-card__preview-scroll',
                        'gl-img-scroll-container',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <div
                        className={[
                            'res-template-card__img',
                            'gl-img',
                            shouldScroll ? 'scrollable' : 'non-scrollable',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <img
                            key={imageSrc}
                            ref={imgRef}
                            alt={slide.imageAlt || templateName || `Slide ${slideIndex + 1}`}
                            src={imageSrc}
                        />
                    </div>
                </div>
            )}
            {textContent && (
                <div
                    className={[
                        'res-template-card__carousel-slide-text',
                        'glb-text',
                        !imageSrc ? 'res-template-card__carousel-slide--text-only' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    dangerouslySetInnerHTML={{ __html: textContent }}
                />
            )}
        </div>
    );
};

CarouselSlideContent.propTypes = {
    slide: PropTypes.shape({
        imageSrc: PropTypes.string,
        imageAlt: PropTypes.string,
        text: PropTypes.string,
        html: PropTypes.string,
        previewMode: PropTypes.oneOf(['email', 'push', 'communication']),
    }).isRequired,
    templateName: PropTypes.string,
    slideIndex: PropTypes.number.isRequired,
};

/**
 * Multi-slide carousel body — image + text (or HTML) per slide.
 * Used in Communication listing gallery cards via `carouselSlides` or `renderBody`.
 */
const ResTemplateCardCarouselPreview = ({
    slides = [],
    templateName = '',
    activeIndex,
    onSelect = null,
    className = '',
    isInfoOpen = false,
}) => {
    const hasMultipleSlides = slides.length > 1;
    const isControlled = activeIndex !== undefined && onSelect != null;
    const [internalIndex, setInternalIndex] = useState(activeIndex ?? 0);

    const handleSelect = (selectedIndex) => {
        if (!isControlled) {
            setInternalIndex(selectedIndex);
        }
        onSelect?.(selectedIndex);
    };

    const carouselIndexProps = isControlled
        ? { activeIndex, onSelect: handleSelect }
        : { activeIndex: internalIndex, onSelect: handleSelect };

    if (!slides.length) {
        return <div className="res-template-card__preview-empty" />;
    }

    return (
        <Carousel
            className={[
                'res-template-card__carousel',
                'gaugeslider-wrapper',
                isInfoOpen ? 'galleryCarouselActive' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...carouselIndexProps}
            interval={null}
            indicators={hasMultipleSlides}
            controls={hasMultipleSlides}
        >
            {slides.map((slide, index) => (
                <Carousel.Item key={slide.key || `carousel-slide-${index}`}>
                    <CarouselSlideContent
                        slide={slide}
                        templateName={templateName}
                        slideIndex={index}
                    />
                </Carousel.Item>
            ))}
        </Carousel>
    );
};

ResTemplateCardCarouselPreview.propTypes = {
    slides: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            imageSrc: PropTypes.string,
            imageAlt: PropTypes.string,
            text: PropTypes.string,
            html: PropTypes.string,
            previewMode: PropTypes.oneOf(['email', 'push', 'communication']),
        }),
    ),
    templateName: PropTypes.string,
    activeIndex: PropTypes.number,
    onSelect: PropTypes.func,
    className: PropTypes.string,
    isInfoOpen: PropTypes.bool,
};

/**
 * Default preview body for ResTemplateCard.
 * Renders HTML via iframe (with interaction disabled) or a fallback image thumbnail.
 */
const ResTemplateCardPreview = ({
    html = '',
    thumbnailPath = '',
    contentThumbnail = '',
    templateName = '',
    previewMode = 'email',
    preferRemoteThumbnail = false,
    communicationScale = false,
    className = '',
}) => {
    const imgRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    const resolvedContent = useMemo(() => {
        const raw = html || thumbnailPath || contentThumbnail || '';
        return parseStringifiedContent(raw);
    }, [html, thumbnailPath, contentThumbnail]);

    const htmlContent = isHtmlContent(resolvedContent) ? resolvedContent : '';
    const imageSrc = useMemo(() => {
        if (htmlContent) return '';
        return resolveTemplateThumbnailSrc({
            thumbnailPath,
            contentThumbnail,
            preferRemotePath: preferRemoteThumbnail,
            useRawThumbnailPath: previewMode === 'push',
        });
    }, [htmlContent, thumbnailPath, contentThumbnail, preferRemoteThumbnail, previewMode]);

    useEffect(() => {
        const checkImageHeight = () => {
            if (!imgRef.current) return;
            const imgHeight =
                imgRef.current.height ||
                imgRef.current.naturalHeight ||
                imgRef.current.offsetHeight;
            setShouldScroll(imgHeight >= TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD);
        };

        const img = imgRef.current;
        if (!img) return undefined;

        img.addEventListener('load', checkImageHeight);
        if (img.complete) checkImageHeight();

        return () => img.removeEventListener('load', checkImageHeight);
    }, [imageSrc]);

    if (htmlContent) {
        if (communicationScale) {
            return (
                <div className={`res-template-card__preview res-template-card__preview--scaled ${className}`.trim()}>
                    <iframe
                        title={`preview-${templateName || 'template'}`}
                        srcDoc={injectPreviewCss(htmlContent, previewMode)}
                        className="res-template-card__preview-iframe res-template-card__preview-iframe--communication"
                        tabIndex={-1}
                    />
                    <div className="res-template-card__preview-blocker" aria-hidden="true" />
                </div>
            );
        }

        return (
            <div
                className={[
                    'res-template-card__preview-scroll',
                    shouldScroll ? 'res-template-card__preview-scroll--scrollable css-scrollbar' : '',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div
                    className={[
                        'res-template-card__img',
                        'gl-img',
                        htmlContent.trim() ? 'iframe-container' : '',
                        shouldScroll ? 'scrollable' : 'non-scrollable',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <iframe
                        title={`preview-${templateName || 'template'}`}
                        srcDoc={injectPreviewCss(htmlContent, previewMode)}
                        className="res-template-card__preview-iframe email-preview-iframe"
                        tabIndex={-1}
                    />
                </div>
            </div>
        );
    }

    if (!imageSrc) {
        return <div className={`res-template-card__preview-empty ${className}`.trim()} />;
    }

    if (communicationScale) {
        return (
            <div className={`res-template-card__preview-image res-template-card__preview-image--communication ${className}`.trim()}>
                <img
                    alt={templateName || 'Template preview'}
                    src={imageSrc}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={[
                'res-template-card__preview-scroll',
                shouldScroll ? 'res-template-card__preview-scroll--scrollable css-scrollbar' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div
                className={[
                    'res-template-card__img',
                    'gl-img',
                    shouldScroll ? 'scrollable' : 'non-scrollable',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <img
                    ref={imgRef}
                    alt={templateName || 'Template preview'}
                    src={imageSrc}
                    onLoad={() => {
                        if (!imgRef.current) return;
                        const imgHeight =
                            imgRef.current.naturalHeight || imgRef.current.offsetHeight;
                        setShouldScroll(imgHeight >= TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD);
                    }}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        </div>
    );
};

ResTemplateCardPreview.propTypes = {
    html: PropTypes.string,
    thumbnailPath: PropTypes.string,
    contentThumbnail: PropTypes.string,
    templateName: PropTypes.string,
    /** Controls which iframe CSS bundle is injected: email | push | communication */
    previewMode: PropTypes.oneOf(['email', 'push', 'communication']),
    preferRemoteThumbnail: PropTypes.bool,
    /** Communication flow uses a 0.5 scale iframe overlay instead of gallery scroll container */
    communicationScale: PropTypes.bool,
    className: PropTypes.string,
};

/**
 * Plain text body for gallery cards (WhatsApp / web push text-only payloads).
 */
const ResTemplateCardTextPreview = ({ text = '', className = '' }) => {
    const normalized = String(text ?? '').trim();
    if (!normalized) {
        return <div className={`res-template-card__preview-empty ${className}`.trim()} />;
    }

    return (
        <div
            className={[
                'res-template-card__carousel-slide-text',
                'res-template-card__carousel-slide--text-only',
                'glb-text',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            dangerouslySetInnerHTML={{ __html: formatGalleryTextHtml(normalized) }}
        />
    );
};

ResTemplateCardTextPreview.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string,
};

/**
 * Dispatches body content by variant — pass as ResTemplateCard `body` prop.
 * contentVariant: carousel | iframe | image | text
 */
const ResTemplateCardBody = ({
    contentVariant = 'image',
    templateName = '',
    className = '',
    slides = [],
    carouselActiveIndex,
    onCarouselSelect = null,
    isInfoOpen = false,
    html = '',
    previewMode = 'email',
    communicationScale = false,
    thumbnailPath = '',
    contentThumbnail = '',
    preferRemoteThumbnail = false,
    imageSrc = '',
    text = '',
}) => {
    switch (contentVariant) {
        case 'carousel': {
            const carouselProps = {
                slides,
                templateName,
                className,
                isInfoOpen,
            };

            if (onCarouselSelect != null) {
                carouselProps.activeIndex = carouselActiveIndex;
                carouselProps.onSelect = onCarouselSelect;
            }

            return <ResTemplateCardCarouselPreview {...carouselProps} />;
        }
        case 'iframe':
            return (
                <ResTemplateCardPreview
                    html={html}
                    thumbnailPath={thumbnailPath}
                    contentThumbnail={contentThumbnail}
                    templateName={templateName}
                    previewMode={previewMode}
                    preferRemoteThumbnail={preferRemoteThumbnail}
                    communicationScale={communicationScale}
                    className={className}
                />
            );
        case 'text':
            return <ResTemplateCardTextPreview text={text} className={className} />;
        case 'image':
        default:
            return (
                <ResTemplateCardPreview
                    thumbnailPath={thumbnailPath || imageSrc}
                    contentThumbnail={contentThumbnail}
                    templateName={templateName}
                    previewMode={previewMode}
                    preferRemoteThumbnail={preferRemoteThumbnail}
                    communicationScale={communicationScale}
                    className={className}
                />
            );
    }
};

ResTemplateCardBody.propTypes = {
    contentVariant: PropTypes.oneOf(['carousel', 'iframe', 'image', 'text']),
    templateName: PropTypes.string,
    className: PropTypes.string,
    slides: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            imageSrc: PropTypes.string,
            imageAlt: PropTypes.string,
            text: PropTypes.string,
            html: PropTypes.string,
            previewMode: PropTypes.oneOf(['email', 'push', 'communication']),
        }),
    ),
    carouselActiveIndex: PropTypes.number,
    onCarouselSelect: PropTypes.func,
    isInfoOpen: PropTypes.bool,
    html: PropTypes.string,
    previewMode: PropTypes.oneOf(['email', 'push', 'communication']),
    communicationScale: PropTypes.bool,
    thumbnailPath: PropTypes.string,
    contentThumbnail: PropTypes.string,
    preferRemoteThumbnail: PropTypes.bool,
    imageSrc: PropTypes.string,
    text: PropTypes.string,
};

/**
 * Optional gl-body wrapper — bordered preview area + communication hover overlay.
 * Pass as ResTemplateCard `bodyContent` when you need the standard body chrome.
 */
const ResTemplateCardBodySlot = ({
    children = null,
    className = '',
    showOverlay = false,
    overlay = null,
    actionButtons = null,
}) => (
    <div className={['res-template-card__body', 'gl-body', className].filter(Boolean).join(' ')}>
        {children}
        {showOverlay && (
            <div className="res-template-card__interaction">
                {overlay || <div className="res-template-card__overlay overlay" />}
                {actionButtons && (
                    <div className="res-template-card__actions template-buttons-section">
                        {actionButtons}
                    </div>
                )}
            </div>
        )}
    </div>
);

ResTemplateCardBodySlot.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    showOverlay: PropTypes.bool,
    overlay: PropTypes.node,
    actionButtons: PropTypes.node,
};

export default memo(ResTemplateCardPreview);
export {
    ResTemplateCardCarouselPreview,
    ResTemplateCardTextPreview,
    ResTemplateCardBody,
    ResTemplateCardBodySlot,
};
