import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { textFormatter } from 'Utils/modules/stringUtils';
import { link_mini, pdf_download_large } from 'Constants/GlobalConstant/Glyphicons';
/**
 * Channel-wise preview handlers - use common prop names from ctx
 */
import { Carousel } from 'react-bootstrap';

import { locationPreview } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Whatsapp/constant';
import { toEmbedUrl, getMediaFormatFromUrl, getCarouselUrlFormat, PREVIEW_SOURCE } from './utils';
import MediaPreview from './components/MediaPreview';

// ─── Shared: render media by URL ────────────────────────────────────────────
export const renderMediaByUrl = (url, urlFormat) => {
    if (!url) return null;
    const format = urlFormat || getMediaFormatFromUrl(url);
    if (format === 'embed') {
        return (
            <div className="video-embed-wrapper mb10">
                <iframe width="100%" height="auto" src={toEmbedUrl(url)} style={{ pointerEvents: 'none' }} title="media" />
            </div>
        );
    }
    if (format === 'video') {
        return (
            <video className="w-100" controls style={{ width: '200px', margin: '0px auto', height: 'auto' }}>
                <source src={url} type="video/mp4" />
            </video>
        );
    }
    if (format === 'image') return <img src={url} alt="preview" />;
    if (format === 'doc') {
        return <i className={`${pdf_download_large} icon-lg color-primary-blue pe-none`} />;
    }
    return null;
};

// ─── SMS ────────────────────────────────────────────────────────────────────
export const handlePreviewSms = (ctx) => {
    const { content, date } = ctx;
    return (
        <div className='message-bubble SMS'>
            {/* <div className="rsm-message-content-info">SMS<div className="date">{getUserCurrentFormat(date || new Date())?.dateTimeFormat}</div></div> */}
            {!!content && content.length > 7 && (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </div>
    );
};

// ─── MMS ────────────────────────────────────────────────────────────────────
export const handlePreviewMms = (ctx) => {
    const { content } = ctx;
    return (
        <>
            <div className="rsm-message-content-info">SMS<div className="date">Today, 12:05 PM</div></div>
            {!!content && content.length > 7 && (
                <div className="mms" dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </>
    );
};

// ─── LINE ───────────────────────────────────────────────────────────────────
export const handlePreviewLine = (ctx) => {
    const { content } = ctx;
    return (
        <>
            <div className="rsm-message-content-info"><div className="whatsapp-date">Today</div></div>
            {!!content && content.length > 7 && (
                <div className="line wbrw-content" dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </>
    );
};

// ─── VIBER ──────────────────────────────────────────────────────────────────
export const handlePreviewViber = (ctx) => {
    const { content } = ctx;
    return (
        <>
            <div className="rsm-message-content-info">SMS<div className="date">Today, 12:05 PM</div></div>
            {!!content && content.length > 7 && (
                <div className="viber" dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </>
    );
};

// ─── RCS ────────────────────────────────────────────────────────────────────
const getRcsActionBtnContent = (actions) => {
    if (!actions?.length) return null;
    return (
        <div className="d-flex justify-content-center flex-column mt10">
            {actions?.map((item, index) => (
                <div key={index} className='RCS-cta'>
                    <button className='bg-tertiary-grey p8 w-100 border-r10'>
                        {item?.actionName}
                    </button>
                </div>
            ))}
        </div>

    );
};

const getRcsCarouselRenderContent = (rcsContent) => {
    if (!rcsContent?.length) return null;
    return (
        <Carousel interval={null} indicators={false} controls>
            {rcsContent.map((card, index) => {
                const { cardTitle, cardDesctiption, cardDescription, bannerValue, bannerType, actions } = card;
                const cardDesc = cardDesctiption ?? cardDescription;
                return (
                    <Carousel.Item key={index} className="css-scrollbar">
                        {!!bannerValue && (
                            <>
                                {bannerType === 'Video' ? (
                                    <video className="d-block w-100" controls>
                                        <source src={bannerValue} type="video/mp4" />
                                    </video>
                                ) : (
                                    <img className="d-block w-100" src={bannerValue} alt={`carousel-img-${index}`} />
                                )}
                            </>
                        )}
                        <div className='p12'>
                            <div className="whitespace-pre-wrap">
                                <b>{cardTitle}</b>
                                <p>{cardDesc}</p>
                            </div>
                            {!!actions?.length && getRcsActionBtnContent(actions)}
                        </div>
                    </Carousel.Item>
                );
            })}
        </Carousel>
    );
};

const getRcsSingleCardContent = (rcsContent) => {
    if (!rcsContent || Array.isArray(rcsContent)) return null;
    const { bannerValue, bannerType, cardTitle, cardDesctiption, cardDescription, actions } = rcsContent;
    const cardDesc = cardDesctiption ?? cardDescription;
    return (
        <div>
            {!!bannerValue && (
                <div className="mb10">
                    {bannerType === 'Video' ? (
                        <video className="w-100" controls>
                            <source src={bannerValue} />
                        </video>
                    ) : (
                        <img src={bannerValue} alt="rcs-banner" className="w-100" />
                    )}
                </div>
            )}
            <div className={`whitespace-pre-wrap ${!!actions?.length ? '' : 'p10'} `}>
                <p className="text-left mb-0">{cardTitle}</p>
                <p className="text-left mb-0">{cardDesc}</p>
            </div>
            {!!actions?.length && getRcsActionBtnContent(actions)}
        </div>
    );
};

export const handlePreviewRcs = (ctx) => {
    const {
        content,
        schedule,
        date,
        previewImage,
        imagePath,
        urlFormat,
        previewImageError,
        imageError,
        setImageError,
        customRenderContent,
        carouselContent,
        contentJson,
        carouselJSON,
        isCarousel,
    } = ctx;

    const rcsContent = (() => {
        const hasCarouselJson = carouselJSON != null && typeof carouselJSON === 'string' && carouselJSON.trim() !== '';
        if (isCarousel && hasCarouselJson) {
            try {
                const parsed = JSON.parse(carouselJSON.trim());
                return parsed != null ? (Array.isArray(parsed) ? parsed : [parsed]) : null;
            } catch {
                return null;
            }
        }
        const hasContentJson = contentJson != null && typeof contentJson === 'string' && contentJson.trim() !== '';
        if (hasContentJson) {
            try {
                const parsed = JSON.parse(contentJson.trim());
                return parsed != null ? parsed : null;
            } catch {
                return null;
            }
        }
        const hasContent = content != null && typeof content === 'string' && content.trim().length > 0;
        if (hasContent) {
            const trimmed = content.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed) || (parsed && typeof parsed === 'object' && (parsed.bannerValue != null || parsed.cardTitle != null || parsed.cardDesctiption != null || parsed.cardDescription != null || parsed.carousel != null || parsed.actions != null))) {
                        return parsed;
                    }
                } catch {
                }
            }
        }
        return null;
    })();

    const isRcsCarousel = Array.isArray(rcsContent);
    const isRcsSingleCard = rcsContent && !Array.isArray(rcsContent) && typeof rcsContent === 'object';

    if (isRcsCarousel) {
        return (
            <>
                {/* <div className="rsm-message-content-info"><div>{getUserCurrentFormat(schedule || date || new Date())?.dateTimeFormat}</div></div> */}
                <div className={`message-bubble ${isCarousel || !!carouselContent || rcsContent?.length > 1 ? 'p0' : ''}`}>
                    <div>
                        {getRcsCarouselRenderContent(rcsContent)}
                    </div>
                </div>
            </>
        );
    }

    if (isRcsSingleCard) {
        return (
            <>
                {/* <div className="rsm-message-content-info"><div>{getUserCurrentFormat(schedule || date || new Date())?.dateTimeFormat}</div></div> */}
                <div className={`message-bubble ${isCarousel || !!carouselContent || rcsContent?.length > 1 ? 'p0' : ''}`}>
                    <div>
                        {getRcsSingleCardContent(rcsContent)}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* <div className="rsm-message-content-info"><div>{getUserCurrentFormat(schedule || date || new Date())?.dateTimeFormat}</div></div> */}
            <div className={`message-bubble ${isCarousel || !!carouselContent || rcsContent?.length > 1 ? 'p0' : ''}`}>
                {carouselContent ? (
                    <div className="wbrw-content">{carouselContent}</div>
                ) : ((!!content && content.length > 7) || previewImage) && (
                    <div className="wbrw-content">
                        {!!urlFormat && (previewImage || imagePath) && (
                            <MediaPreview
                                urlFormat={urlFormat}
                                previewImage={previewImage || imagePath}
                                hasError={previewImageError || imageError}
                                onImageError={() => setImageError?.(true)}
                            />
                        )}
                        {content ? <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }} /> : null}
                        {customRenderContent}
                    </div>
                )}
            </div>
        </>
    );
};

// ─── WhatsApp ───────────────────────────────────────────────────────────────
const ActionButtons = ({ actions, isLoc }) => (actions?.length ? (
    <div className="d-flex flex-column text-center">
        {actions.map((item, i) => (
            <div key={`${item?.actionName ?? 'action'}-${i}`} className="whatsapp-cta align-items-center d-flex justify-content-center">
                {<i
                    className={`${link_mini} icon-xs`}
                />} {item?.actionName}
            </div>
        ))}
    </div>
) : null);



export const handlePreviewWhatsapp = (ctx) => {
    const {
        content,
        schedule,
        date,
        header,
        footer,
        headerContent,
        previewImage,
        imagePath,
        urlFormat,
        previewImageError,
        imageError,
        setImageError,
        customRenderContent,
        customRenderClassName,
        carouselContent,
        isListing,
        whatsAppContent,
        parsedData,
        listingUrlFormat,
        summary,
        fromGallery,
        isCarousel,
        sourceConfig,
        previewSource,
        mediaType,
        locationDetails,
    } = ctx;

    const bubbleClass = sourceConfig?.bubbleClass || (fromGallery ? 'gallery_whatsApp' : '');

    const timeStamp = () => {
        return previewSource === PREVIEW_SOURCE.AUTHORING ? (
            <small className={`text-end fs11 ${carouselContent ? 'mt10' : ''}`}>
                {getUserCurrentFormat(schedule)?.formatTime}
            </small>
        ) : null;
    };

    const isLocation =
        parsedData?.content?.mediaType === 'location' ||
        mediaType === 'location';
    const locationInfo = parsedData?.mediaType || locationDetails || {};
    const locationName =
        locationInfo?.name ?? locationInfo?.locationName ?? '';
    const locationAddress =
        locationInfo?.address ?? locationInfo?.locationAddress ?? '';

    if (isLocation) {
        return (
            <div className='message-bubble border-r10'>
                {customRenderContent}
                {!customRenderContent && locationPreview({
                    actionList: <ActionButtons actions={parsedData?.content?.actions} isLoc />,
                    editorText: content,
                    footer,
                    isFooter: !!footer,
                    locationAddress,
                    locationName,
                    isTimeStamp: previewSource === PREVIEW_SOURCE.AUTHORING || previewSource === PREVIEW_SOURCE.LIVE_PREVIEW,
                    schedule,
                })}
                {!customRenderContent && timeStamp()}
            </div>
        );
    }

    // Authoring carousel: pre-rendered React node
    if (carouselContent) {
        return (
            <>
                <div className='message-bubble border-r10'>
                    <div dangerouslySetInnerHTML={{ __html: textFormatter(headerContent) }} />
                    {timeStamp()}
                    {carouselContent}
                </div>
            </>
        );
    }

    // Listing carousel: from carouselJSON / whatsAppContent
    if (Array.isArray(whatsAppContent) && whatsAppContent.length > 0) {
        return (
            <>
                <div className='message-bubble border-r10'>
                    {content && (
                        <p className="mb5 fs15 text-left text-wrap whatsapp-content" dangerouslySetInnerHTML={{ __html: textFormatter(content) }} />
                    )}
                    {timeStamp()}
                    <div className="whatsApp-content-wrapper">
                        <div className={`wbrw-content ${bubbleClass}`}>
                            <Carousel className="gaugeslider-wrapper whatsapp-carousel" interval={null} indicators controls>
                                {whatsAppContent.map((item, idx) => (
                                    <Carousel.Item key={idx}>
                                        {item.mediaValue && (
                                            <div className="carousel-media-container css-scrollbar">
                                                {getCarouselUrlFormat(item.mediaValue) === 'embed' ? (
                                                    <div className="video-embed-wrapper">
                                                        <iframe width="100%" height="auto" src={toEmbedUrl(item.mediaValue)} style={{ pointerEvents: 'none', width: '200px', margin: '0px auto' }} title="carousel" />
                                                    </div>
                                                ) : getCarouselUrlFormat(item.mediaValue) === 'video' ? (
                                                    <video className="d-block w-100" controls style={{ width: '200px', margin: '0px auto' }}>
                                                        <source src={item.mediaValue} type="video/mp4" />
                                                    </video>
                                                ) : (
                                                    <img className="d-block carousel-image" src={item.mediaValue} alt="" style={{ width: '200px', margin: '0px auto' }} />
                                                )}
                                            </div>
                                        )}
                                        <div className="carousel-text">
                                            <p  dangerouslySetInnerHTML={{ __html: textFormatter(item.cardBody || item.cardDesctiption || '') }} />
                                        </div>
                                        <ActionButtons actions={item.actions} />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Single bubble: text, header media, footer, actions, customRenderContent
    const hasMedia = !!whatsAppContent?.bannerValue || !!previewImage || !!imagePath || !!header;
    const hasActionsFromJson = !!parsedData?.content?.actions?.length;
    const hasContent = !!content || hasMedia || !!customRenderContent || hasActionsFromJson;

    if (!hasContent) {
        return null;
    }

    let finalPreviewImage =  previewImage || header || imagePath || whatsAppContent?.bannerValue;
    const finalUrlFormat = urlFormat || getMediaFormatFromUrl(finalPreviewImage);

    return (
        <>
            <div className='message-bubble border-r10 p0'>
                <div className={`wbrw-content p10 ${bubbleClass}`}>
                    {!!finalPreviewImage && !!finalUrlFormat && (
                        <MediaPreview
                            urlFormat={finalUrlFormat}
                            previewImage={finalPreviewImage}
                            hasError={previewImageError || imageError}
                            onImageError={() => setImageError(true)}
                        />
                    )}
                    {content && (
                        <div className={`whitespace-pre-wrap ${customRenderClassName || 'mb5'}`} dangerouslySetInnerHTML={{ __html: textFormatter(content) }} />
                    )}
                    {footer && (
                        <small className="d-block mb5">{footer}</small>
                    )}
                    {timeStamp()}
                </div>
                {customRenderContent ?? (hasActionsFromJson ? <ActionButtons actions={parsedData.content.actions} /> : null)}
            </div>
        </>
    );
};
