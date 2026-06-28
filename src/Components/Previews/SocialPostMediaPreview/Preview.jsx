import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react';
import _get from 'lodash/get';
import parse from 'html-react-parser';
import Carousel from 'react-bootstrap/Carousel';

/**
 * Listing / gallery often passes raw base64 without a `data:` prefix, or omits `imagePath` and uses `contentThumbnail`.
 * @param {string} src
 * @param {boolean} [mode] — authoring: allow legacy bare base64 for images
 */
export const normalizePreviewSrc = (src, mode = false) => {
    if (src == null) return '';
    const s = String(src).trim();
    if (!s) return '';
    if (s.startsWith('data:') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//')) {
        return s;
    }
    if (s.startsWith('<') || s.startsWith('{') || s.startsWith('[')) {
        return '';
    }
    // JPEG/PNG base64 commonly contains `/` (e.g. "/9j/4AAQ…"); do not reject on `/`.
    const compact = s.replace(/\s/g, '');
    const isB64Alphabet = /^[A-Za-z0-9+/=]+$/.test(compact);
    const looksBareBase64 =
        isB64Alphabet &&
        !compact.includes('://') &&
        (compact.length >= 80 ||
            (compact.length >= 24 && (compact.startsWith('/9j') || compact.startsWith('iVBOR'))));
    if (looksBareBase64) {
        const mime = compact.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
        return `data:${mime};base64,${compact}`;
    }
    if (mode && s.length > 0 && !s.includes('://')) {
        return `data:image/png;base64,${s}`;
    }
    return s;
};

/** @param {string} src */
const inferMediaKindFromSrc = (src) => {
    if (typeof src !== 'string' || !src) return 'image';
    const head = src.slice(0, 400).toLowerCase();
    if (head.startsWith('data:video/') || head.includes('data:video/')) return 'video';
    if (head.startsWith('data:application/pdf')) return 'pdf';
    if (/\.(mp4|mov|m4v|webm)(\?|#|$)/i.test(src)) return 'video';
    return 'image';
};

/**
 * @param {string} src
 * @param {'image' | 'video' | 'pdf' | 'article'} [previewMediaType]
 * @param {boolean} [isGallery] — carousel / multi-slide: infer image vs video per slide
 */
const getSlideMediaKind = (src, previewMediaType, isGallery) => {
    if (isGallery) return inferMediaKindFromSrc(src);
    if (previewMediaType === 'article') return 'image';
    if (previewMediaType === 'video') return 'video';
    if (previewMediaType === 'pdf') return 'pdf';
    return inferMediaKindFromSrc(src);
};

/** Normalize gallery entry to `{ src, mediaKind? }` (mediaKind from upload flow when inference is ambiguous). */
const toPreviewSlide = (g) => {
    if (typeof g === 'string') {
        const src = String(g).trim();
        return src ? { src, mediaKind: null } : null;
    }
    const src = String(g?.src || '').trim();
    if (!src) return null;
    const mk = g?.mediaKind === 'video' || g?.mediaKind === 'image' ? g.mediaKind : null;
    return { src, mediaKind: mk };
};

const PDF_PREVIEW_BASE_W = 816;
const PDF_PREVIEW_BASE_H = 1056;
const PDF_PREVIEW_BAND_H = 150;

/** @param {string} src */
const withPdfViewerHash = (src) => {
    if (typeof src !== 'string' || !src) return src;
    const params = 'toolbar=0&navpanes=0&scrollbar=0&view=FitH';
    return src.includes('#') ? `${src}&${params}` : `${src}#${params}`;
};

const PdfLivePreview = ({ src }) => {
    const clipRef = useRef(null);
    const [transform, setTransform] = useState('scale(0.15, 0.14)');

    useLayoutEffect(() => {
        const el = clipRef.current;
        if (!el) return;
        const update = () => {
            const w = el.clientWidth;
            if (w <= 0) return;
            const sx = w / PDF_PREVIEW_BASE_W;
            const sy = PDF_PREVIEW_BAND_H / PDF_PREVIEW_BASE_H;
            setTransform(`scale(${Math.max(sx, 0.05)}, ${Math.max(sy, 0.05)})`);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={clipRef} className="social-post-live-preview-pdf-clip">
            <div
                className="social-post-live-preview-pdf-scale"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    width: PDF_PREVIEW_BASE_W,
                    height: PDF_PREVIEW_BASE_H,
                    marginLeft: -(PDF_PREVIEW_BASE_W / 2),
                    transform,
                    transformOrigin: 'top center',
                }}
            >
                <iframe
                    title="PDF preview"
                    width={PDF_PREVIEW_BASE_W}
                    height={PDF_PREVIEW_BASE_H}
                    src={withPdfViewerHash(src)}
                    className="social-post-live-preview-pdf"
                />
            </div>
        </div>
    );
};

const Preview = ({
    previewImage,
    galleryImages,
    editorText,
    customization,
    mode,
    previewLayout,
    previewMediaType = 'image',
}) => {
    const editorBackground = _get(customization, 'background', null);
    const editorColor = _get(customization, 'color', null);
    const isInstagramLayout = previewLayout === 'instagram';
    const isFacebookLayout = previewLayout === 'facebook';
    const isLinkedInLayout = previewLayout === 'linkedIn';
    const livePreviewImgClass = 'social-post-live-preview-img';

    const slideSrcs = useMemo(() => {
        if (Array.isArray(galleryImages) && galleryImages.length > 0) {
            return galleryImages
                .map(toPreviewSlide)
                .filter(Boolean)
                .map((slide) => ({
                    ...slide,
                    src: normalizePreviewSrc(slide.src, mode),
                }))
                .filter((slide) => slide.src);
        }
        if (previewImage && previewImage !== '') {
            const src = normalizePreviewSrc(previewImage, mode);
            return src ? [{ src, mediaKind: null }] : [];
        }
        return [];
    }, [galleryImages, previewImage, mode]);

    const resolveSlideKind = (slide, isGalleryMulti) => {
        if (slide?.mediaKind === 'video' || slide?.mediaKind === 'image') {
            return slide.mediaKind;
        }
        return getSlideMediaKind(slide.src, previewMediaType, isGalleryMulti);
    };

    const carouselClassName = [
        'social-post-image-carousel',
        isInstagramLayout && 'social-post-image-carousel--instagram',
        isLinkedInLayout && 'social-post-image-carousel--linkedin',
        !isInstagramLayout && !isFacebookLayout && !isLinkedInLayout && 'mb10',
    ]
        .filter(Boolean)
        .join(' ');

    const innerWrapClassName = [
        'social-post-preview-inner',
        isInstagramLayout && 'social-post-preview-inner--instagram',
        isFacebookLayout && 'social-post-preview-inner--facebook',
        isLinkedInLayout && 'social-post-preview-inner--linkedin',
    ]
        .filter(Boolean)
        .join(' ');

    const singleImgClassName = [
        livePreviewImgClass,
        'd-block',
        isInstagramLayout && 'social-post-preview-single-img social-post-preview-single-img--instagram',
        isLinkedInLayout && 'social-post-preview-single-img social-post-preview-single-img--linkedin',
    ]
        .filter(Boolean)
        .join(' ');

    const renderSlide = (slide, { single } = { single: false }) => {
        const isGalleryMulti = !single && slideSrcs.length > 1;
        const kind = resolveSlideKind(slide, isGalleryMulti);
        const src = slide.src;
        if (!src) return null;

        if (kind === 'video') {
            return (
                <video
                    src={src}
                    className={`d-block social-post-live-preview-video ${livePreviewImgClass}`}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                />
            );
        }
        if (kind === 'pdf') {
            return <PdfLivePreview src={src} />;
        }
        const imgSrc =
            src && !src.startsWith('data:image') && !src.startsWith('http') && mode
                ? `data:image/png;base64,${src}`
                : src;
        return <img src={imgSrc} alt="" className={`d-block ${livePreviewImgClass}`} />;
    };

    const singleNonImageWrapClass = [
        'social-post-preview-single-media',
        isInstagramLayout && 'social-post-preview-single-img social-post-preview-single-img--instagram',
        isLinkedInLayout && 'social-post-preview-single-img social-post-preview-single-img--linkedin',
    ]
        .filter(Boolean)
        .join(' ');

    const singleKind = slideSrcs.length === 1 ? resolveSlideKind(slideSrcs[0], false) : null;

    if (slideSrcs.length === 0 && !editorText) {
        return null;
    }

    return (
        <Fragment>
            <div className="social-post-preview-outer">
                <div className={innerWrapClassName}>
                    {slideSrcs.length > 1 && (
                        <Carousel indicators controls className={carouselClassName} interval={null}>
                            {slideSrcs.map((slide, index) => (
                                <Carousel.Item key={`${index}-${slide.src}`}>
                                    {renderSlide(slide, { single: false })}
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    )}
                    {slideSrcs.length === 1 && (singleKind === 'video' || singleKind === 'pdf') && (
                        <div className={singleNonImageWrapClass}>
                            {renderSlide(slideSrcs[0], { single: true })}
                        </div>
                    )}
                    {slideSrcs.length === 1 && singleKind === 'image' && (
                        <img
                            src={
                                slideSrcs[0].src &&
                                !slideSrcs[0].src.startsWith('data:image') &&
                                !slideSrcs[0].src.startsWith('http') &&
                                mode
                                    ? `data:image/png;base64,${slideSrcs[0].src}`
                                    : slideSrcs[0].src
                            }
                            alt="preview"
                            className={singleImgClassName}
                        />
                    )}
                    {editorText && (
                        <div
                            style={{
                                background: editorBackground,
                                color: editorColor,
                            }}
                        >
                            {parse(editorText)}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
};

export default Preview;
