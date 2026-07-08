import { getUserDetails, isBase64 } from 'Utils/modules/crypto';
import { getfullFormat, getUserCurrentFormat } from 'Utils/modules/dateTime';
/**
 * Single unified preview component - all channels, all flows.
 * Usage: <RSMobilePreview channel="whatsapp" content={...} /> or <RSMobilePreview bubbleType={{type:'sms'}} bubbleContent={...} />
 */
import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';

import { getUrlFormat, getUrlFormatForMedia } from './utils';
import { CHANNELS, normalizeProps, PREVIEW_SOURCE } from './utils';
import {
    handlePreviewSms,
    handlePreviewMms,
    handlePreviewLine,
    handlePreviewViber,
    handlePreviewRcs,
    handlePreviewWhatsapp,
} from './previewHandlers';
import PreviewHeader from './components/PreviewHeader';



const RSMobilePreviewInner = (props) => {
    const CHANNEL_HANDLERS = {
    [CHANNELS.SMS]: handlePreviewSms,
    [CHANNELS.MMS]: handlePreviewMms,
    [CHANNELS.LINE]: handlePreviewLine,
    [CHANNELS.VIBER]: handlePreviewViber,
    [CHANNELS.RCS]: handlePreviewRcs,
    [CHANNELS.WHATSAPP]: handlePreviewWhatsapp,
};
    const p = normalizeProps(props);
    const {
        channel, date, schedule, content, header, footer, headerContent, previewImage, imagePath,
        carouselJSON, isCarousel, contentJson, fromGallery, mdcType, smsContent,
        customRenderContent, customRenderClassName, carouselContent, senderName,
        previewSource, sourceConfig, mediaType,
        locationDetails: propsLocationDetails,
        locationName: propsLocationName,
        locationAddress: propsLocationAddress,
    } = p;
    const ctx = useFormContext();
    const formErrors = p.formErrors ?? ctx?.formState?.errors ?? {};

    const [urlFormat, setUrlFormat] = useState('');
    const [imageError, setImageError] = useState(false);
    const [listingUrlFormat, setListingUrlFormat] = useState('');

    const { firstName } = getUserDetails();
    const { clientId } = useSelector(({ globalstate }) => globalstate) || {};
    const summary = useSelector((s) => getSummaryList(s));
    const displayName = clientId?.clientName || firstName || '';
    const previewImageError = !!formErrors?.previewImage;

    useEffect(() => {
        const src = previewImage || imagePath || header;
        setUrlFormat(getUrlFormatForMedia(src, mediaType));
        setImageError(false);
    }, [previewImage, imagePath, header, mediaType]);

    const timestampLabel = getfullFormat(schedule || date || new Date());
    const isListing = !!(carouselJSON || contentJson || mdcType || fromGallery || sourceConfig?.isListing);

    const whatsAppContent = useMemo(() => {
        if (isCarousel && carouselJSON) {
            try {
                const parsed = JSON.parse(carouselJSON);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch { return []; }
        }
        return { bannerValue: previewImage || imagePath || header || '', cardDesctiption: content || smsContent, actions: [] };
    }, [isCarousel, carouselJSON, content, smsContent, imagePath, previewImage, header]);

    const parsedData = useMemo(() => {
        try {
            if (!contentJson) return null;
            const parsedContent = JSON.parse(contentJson);
            const parsedMediaType = parsedContent?.mediaURL
                ? (() => { try { return JSON.parse(parsedContent.mediaURL); } catch { return null; } })()
                : null;
            return {
                content: parsedContent,
                mediaType: parsedMediaType,
            };
        } catch {
            return null;
        }
    }, [contentJson]);

    const contentFromJson = parsedData?.content?.templateContent ?? parsedData?.content?.content ?? '';
    const headerFromJson = parsedData?.content?.header ?? '';
    const footerFromJson = parsedData?.content?.footer ?? '';
    const effectiveContent = contentFromJson || content;
    const effectiveHeader = header || headerFromJson;
    const effectiveFooter = footer || footerFromJson;

    const locationFromParsedData =
        parsedData?.content?.mediaType === 'location' && parsedData?.mediaType
            ? { name: parsedData.mediaType.name, address: parsedData.mediaType.address }
            : undefined;
    const locationDetails =
        propsLocationDetails ??
        locationFromParsedData ??
        (propsLocationName != null || propsLocationAddress != null ? { name: propsLocationName, address: propsLocationAddress } : undefined);

    useEffect(() => {
        if (whatsAppContent?.bannerValue) setListingUrlFormat(getUrlFormat(whatsAppContent.bannerValue));
    }, [whatsAppContent?.bannerValue]);

    // MDC image only - no frame
    if (channel === CHANNELS.WHATSAPP && mdcType === 'RecursivelyTraverse' && content && isBase64(content)) {
        const imgSrc = content.trim().startsWith('data:') ? content.trim() : `data:image/jpeg;base64,${content.trim()}`;
        return (
            <div className={p.className}>
                <div className="mdc-whatsapp-image-preview"><img src={imgSrc} alt="content" /></div>
            </div>
        );
    }

    const handlerCtx = {
        content: effectiveContent,
        date,
        schedule,
        header: effectiveHeader,
        footer: effectiveFooter,
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
        previewSource,
        sourceConfig,
        contentJson,
        carouselJSON,
        mediaType,
        locationDetails,
    };

    const handler = CHANNEL_HANDLERS[channel];
    const renderContent = handler ? handler(handlerCtx) : null;

    if (!channel) return null;
    const isEmptyContent =
        typeof effectiveContent === 'string'
            ? effectiveContent.replace(/<[^>]*>/g, '').trim() === ''
            : !effectiveContent;


    const whatsAppTimeStamp = () => {
        const waSchedule = summary?.factModel?.whatsapp?.[0]?.scheduleDateTime ?? schedule ?? date;
        return (
            <div className="bg-white border-r7 d-table mx-auto px15 timestamp">
                {getUserCurrentFormat(waSchedule)?.dateFormat}
            </div>
        )
    }


    return (
        <div className={`rs-mobile-frame-wrapper-new ${channel === 'whatsapp' ? 'whatsapp_frame' : channel === 'rcs' ? 'rcs_custom' : ''} ${p.className || ''}`.trim()}>
            <div className="android-frame">
                <div className="header">
                    <PreviewHeader
                        channelType={channel}
                        displayName={displayName}
                        senderName={senderName}
                        logoPath={clientId?.logoPath}
                        imageError={imageError}
                        onImageError={() => setImageError(true)}
                    />
                </div>
                {/* rsm-content-wrapper rsm-background-${channel} */}
                <div className="css-scrollbar chat-area">
                    {!isEmptyContent || mediaType === 'location' || !!carouselContent || parsedData?.content?.mediaType === 'location' ? (
                        <>
                            {
                               ( previewSource === PREVIEW_SOURCE.AUTHORING || previewSource === PREVIEW_SOURCE.LIVE_PREVIEW)  && (
                                    channel === "whatsapp"
                                        ? whatsAppTimeStamp()
                                        : <div className="timestamp">{timestampLabel}</div>
                                )
                            }
                            <div className={''}>{renderContent}</div>
                        </>
                    ) : (
                        <div className="align-items-center bottom0 d-flex justify-content-center left0 position-absolute right0 top0 color-secondary-black">Preview not available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RSMobilePreview = (props) => {
    if (props.formErrors !== undefined) {
        return <RSMobilePreviewInner {...props} />;
    }
    const form = useForm({ defaultValues: {} });
    return (
        <FormProvider {...form}>
            <RSMobilePreviewInner {...props} />
        </FormProvider>
    );
};

RSMobilePreview.propTypes = {
    channel: PropTypes.oneOf(['sms', 'mms', 'whatsapp', 'rcs', 'line', 'viber']),
    bubbleType: PropTypes.shape({ type: PropTypes.string }),
    formErrors: PropTypes.object,
    content: PropTypes.string,
    bubbleContent: PropTypes.string,
    header: PropTypes.string,
    footer: PropTypes.string,
    headerContent: PropTypes.string,
    previewImage: PropTypes.string,
    imagePath: PropTypes.string,
    date: PropTypes.any,
    schedule: PropTypes.any,
    scheduleDate: PropTypes.any,
    carouselJSON: PropTypes.string,
    isCarousel: PropTypes.bool,
    contentJson: PropTypes.string,
    fromGallery: PropTypes.bool,
    previewSource: PropTypes.oneOf(Object.values(PREVIEW_SOURCE)),
    mdcType: PropTypes.string,
    smsContent: PropTypes.string,
    senderName: PropTypes.string,
    customRenderContent: PropTypes.node,
    caruoselContent: PropTypes.node,
    carouselContent: PropTypes.node,
    customRenderClassName: PropTypes.string,
    className: PropTypes.string,
    mediaType: PropTypes.string,
    locationDetails: PropTypes.shape({ name: PropTypes.string, address: PropTypes.string }),
    locationName: PropTypes.string,
    locationAddress: PropTypes.string,
};
export default memo(RSMobilePreview);
