import { scolor1 } from 'Components/Skeleton/Components/constants';
import ImagePreview from 'Pages/AuthenticationModule/Communication/Component/ImagePreview';
import SmsPreview from 'Pages/AuthenticationModule/Communication/Component/SmsPreview';
import QRPreview from 'Pages/AuthenticationModule/Communication/Component/QRPreview';
import RSWebPreview from 'Pages/AuthenticationModule/Communication/Component/RSWebPreview';
import RSMobileListPreview from 'Pages/AuthenticationModule/Communication/Component/RSMobileListPreview';
import SocialPostListPagePreview from 'Pages/AuthenticationModule/Communication/Component/SocialPostListPagePreview/SocialPostListPagePreview';
import EmailListPagePreview from 'Pages/AuthenticationModule/Communication/Component/EmailListPreview/EmailListPreview';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
export { PREVIEW_SOURCE };

/**
 * Communication / analytics listing rows: channels without preview API content.
 * Eye icon is hidden (not shown disabled) for these channel IDs.
 * 6 Web analytics, 16 App analytics, 10 Paid media, 33 Direct mail
 */
export const LISTING_PREVIEW_INELIGIBLE_CHANNEL_IDS = Object.freeze([6, 16, 10, 33]);

export const isListingPreviewEligible = (channelId) =>
    !LISTING_PREVIEW_INELIGIBLE_CHANNEL_IDS.includes(Number(channelId));

const stripPreviewHtml = (value) =>
    String(value ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim();

export const hasListingPreviewApiContent = (channelId, previewResponse, rowContent = {}) => {
    if (!previewResponse?.status) return false;

    const dataList = previewResponse?.data;
    const previewData = Array.isArray(dataList) ? dataList[0] : null;

    if (
        previewData &&
        typeof previewData === 'object' &&
        !Array.isArray(previewData) &&
        Object.keys(previewData).length === 0
    ) {
        return false;
    }

    const cid = Number(channelId);
    const content =
        previewData?.content ??
        rowContent?.content ??
        rowContent?.webContent ??
        rowContent?.galleryImageThump ??
        '';
    const imagePath =
        previewData?.imagePath ||
        previewData?.mediaurl ||
        previewData?.imageUrl ||
        rowContent?.imagePath ||
        rowContent?.galleryImagePath ||
        '';

    switch (cid) {
        case 1:
            return Boolean(stripPreviewHtml(content)) || Boolean(String(imagePath).trim());
        case 8:
            return (
                (Array.isArray(dataList) && dataList.length > 0) ||
                Boolean(stripPreviewHtml(content)) ||
                Boolean(String(imagePath).trim())
            );
        case 14:
            return (
                (Array.isArray(dataList) && dataList.length > 0) ||
                Boolean(stripPreviewHtml(content)) ||
                Boolean(String(imagePath).trim())
            );
        case 7:
            return (
                Boolean(previewData?.postLink) ||
                Boolean(String(imagePath).trim()) ||
                Boolean(stripPreviewHtml(content))
            );
        case 3:
            return Boolean(String(imagePath).trim()) || Boolean(stripPreviewHtml(content));
        case 2:
        case 21:
        case 41:
            return Boolean(stripPreviewHtml(content)) || Boolean(String(imagePath).trim());
        case 25:
        case 26:
            return (
                Boolean(stripPreviewHtml(content)) ||
                Boolean(String(imagePath).trim()) ||
                Boolean(String(previewData?.mediaurl ?? '').trim())
            );
        default:
            return (
                Boolean(stripPreviewHtml(content)) ||
                Boolean(String(imagePath).trim()) ||
                Boolean(String(previewData?.mediaurl ?? '').trim()) ||
                Boolean(String(previewData?.postLink ?? '').trim())
            );
    }
};

export const hasPlannerItemPreviewContent = (item = {}) => {
    const channelId = Number(item?.channelId);

    return hasListingPreviewApiContent(
        channelId,
        {
            status: true,
            data: [
                {
                    content: item?.content ?? item?.campaigncontent ?? '',
                    imagePath: item?.imagePath ?? item?.attachment ?? '',
                    mediaurl: item?.mediaurl ?? '',
                    postLink: item?.postLink ?? '',
                    carouselJSON: item?.carouselJSON,
                    footer: item?.footer,
                    footerContent: item?.footerContent,
                },
            ],
        },
        item,
    );
};

/** Planner modal carousel — info slides + preview-eligible channel campaigns only. */
export const buildPlannerCarouselSlides = (selectedEvent) => {
    const slides = [];

    selectedEvent?.forEach((item) => {
        if (item?.attributeName) {
            slides.push(item);
        }

        if (Array.isArray(item?.campaigns) && item.campaigns.length > 0) {
            item.campaigns.forEach((campaign) => {
                if (isListingPreviewEligible(campaign?.channelId)) {
                    slides.push(campaign);
                }
            });
        } else if (!item?.attributeName && isListingPreviewEligible(item?.channelId)) {
            slides.push(item);
        }
    });

    return slides;
};

export const ListingPreviewNoDataPanel = () => (
    <div
        className="listing-preview-scroll listing-preview-skeleton listing-preview-no-data-panel px0 border-r10 position-relative"
        style={{
            height: 262,
            minHeight: 262,
            width: '100%',
            minWidth: 250,
            background: scolor1,
            border: `1px solid ${scolor1}`,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <NoDataAvailableRender className="nodata-skeleton-con listing-preview-no-data" />
    </div>
);

export const getListingPreviewNoDataPopover = () => ({
    pophover: <ListingPreviewNoDataPanel />,
    className: 'rs-image-preview-box listing-preview-no-data-popover',
});

export function GetpopoverContent(channelId, props) {
    switch (channelId) {
        case 1:
            return {
                pophover: <EmailListPagePreview data={props} />,
                className: 'rs-image-preview-box',
            };
        case 34:
            return {
                pophover: <ImagePreview {...props} />,
                className: `${channelId === 14 ? 'rs-mobile-preview-box' : 'rs-image-preview-box'}`,
            };
        case 2:
            return { pophover: <RSMobilePreview channel="sms"  {...props} />, className: 'rs-listing-messaging-preview float-none mx-auto' };
        case 14:
            if (Array.isArray(props?.slides) && props.slides.length) {
                return {
                    pophover: <RSMobileListPreview slides={props.slides} previewSource={props.previewSource} {...props} />,
                    className: 'mobile tabs-content',
                };
            }
            return { pophover: <ImagePreview {...props} />, className: 'rs-mobile-preview-box' };
        case 41:
            return { pophover: <RSMobilePreview channel="rcs" {...props} />, className: 'rs-listing-messaging-preview float-none mx-auto' };
        case 21:
            return { pophover: <RSMobilePreview channel="whatsapp" {...props} />, className: 'rs-listing-messaging-preview float-none mx-auto' };
        case 3:
            return { pophover: <QRPreview {...props} />, className: 'rs-image-preview-box' };
        case 8:
            if (Array.isArray(props?.notifications) && props.notifications.length) {
                return {
                    pophover: <RSWebPreview notifications={props.notifications} previewImage={props.previewImage} previewSource={props.previewSource} />,
                    className: 'win-chrome windows rs-web-preview-custom-width',
                };
            }
            if (props?.notification) {
                return {
                    pophover: <RSWebPreview {...props} previewSource={props.previewSource} />,
                    className: 'win-chrome windows rs-web-preview-custom-width',
                };
            }
            return {
                pophover: <ImagePreview {...props} />,
                className: 'rs-web-preview-wrapper win-chrome windows',
            };
        case 7:
            return { pophover: <SocialPostListPagePreview data={props} />, className: 'rs-image-preview-box' };
        default:
            return { text: props.content };
    }
}
/**
 * GetpopoverContentPlanner – single options object for all preview data.
 * Pass one object: { channelId, content, senderName, scheduleDate, ... }
 */
export function GetpopoverContentPlanner(options = {}) {
    const opts = typeof options === 'object' && options !== null ? options : {};
    const {
        channelId,
        content,
        senderName,
        smssenderName,
        attachment,
        scheduleDate,
        additionalProps = {},
        carouselJSON = null,
        isCarousel = false,
        header = '',
        footer = '',
        imagePath,
        previewImage,
        socialPostChannelId = '',
        campaigncontent = '',
        contentJson = '',
        className
    } = opts;

    const senderNameVal = senderName ?? smssenderName;
    const previewImageVal = previewImage ?? imagePath ?? attachment;

    switch (channelId) {
        case 1: {
            const campaignHtml =
                typeof campaigncontent === 'string' ? campaigncontent.trim() : '';
            const useHtmlIframe =
                campaignHtml.length > 0 && /<[a-z!?]/i.test(campaignHtml);
            return (
                <div className={className || 'rs-mobile-preview-box'}>
                    <EmailListPagePreview
                        data={{
                            content: useHtmlIframe ? campaignHtml : content || '',
                            footerContent: '',
                            previewImage: (previewImageVal && String(previewImageVal).trim()) || '',
                            showAsHtml: useHtmlIframe,
                            isModalPreview: true,
                        }}
                    />
                </div>
            );
        }
        case 2:
            return (
                <RSMobilePreview
                    channel="sms"
                    previewSource={opts.previewSource ?? PREVIEW_SOURCE.ANALYTICS_LISTING}
                    content={content}
                    senderName={senderNameVal}
                    scheduleDate={scheduleDate}
                    {...opts}
                />
            );
        case 14:
            return (
                <SmsPreview
                    content={content}
                    senderId={senderNameVal}
                    className="sms-prev-box"
                    channelId={channelId}
                    scheduleDate={scheduleDate}
                />
            );
        case 21:
            return (
                <RSMobilePreview
                    channel="whatsapp"
                    previewSource={opts.previewSource ?? PREVIEW_SOURCE.ANALYTICS_LISTING}
                    content={content}
                    senderName={senderNameVal}
                    scheduleDate={scheduleDate}
                    isCarousel={isCarousel}
                    carouselJSON={carouselJSON}
                    header={header}
                    footer={footer}
                    imagePath={previewImageVal}
                    previewImage={previewImageVal}
                    contentJson={contentJson || ''}
                    {...opts}
                />
            );

        case 3:
            return <QRPreview content={content} className="rs-image-preview-box" />;
        case 7: {
            const socialSid = Number(socialPostChannelId);
            if (Number.isFinite(socialSid) && [1, 3, 5, 6, 8].includes(socialSid)) {
                return (
                    <SocialPostListPagePreview
                        data={{
                            socialPostChannelId: socialSid,
                            content: campaigncontent || content,
                            imagePath: previewImageVal,
                            imageUrl: previewImageVal,
                            previewImage: previewImageVal,
                            attachment,
                            contentJson: contentJson || '',
                            scheduleTime: scheduleDate,
                        }}
                    />
                );
            }
            return <ImagePreview content={content} className="rs-mobile-preview-box" channelId={channelId} />;
        }
        case 8:
            if (additionalProps?.notification) {
                return (
                    <RSWebPreview
                        notification={additionalProps.notification}
                        previewImage={additionalProps.previewImage}
                        previewSource={opts.previewSource}
                        className="win-chrome windows rs-web-preview-custom-width"
                    />
                );
            }
            return (
                <ImagePreview
                    content={content}
                    className="rs-web-preview-wrapper win-chrome windows"
                    channelId={channelId}
                />
            );
        case 41:
            return (
                <RSMobilePreview channel="rcs"
                    content={content}
                    senderName={senderNameVal}
                    scheduleDate={scheduleDate}
                    isCarousel={isCarousel}
                    carouselJSON={carouselJSON}
                    header={header}
                    footer={footer}
                    imagePath={previewImageVal}
                    previewImage={previewImageVal}
                    contentJson={contentJson || ''}
                    {...opts}
                />
            );
        case 25:
        case 26:
            return (
                <div className={className || 'rs-mobile-preview-box'}>
                    <ImagePreview content={content} previewImage={previewImageVal} />
                </div>
            );

        default:
            return content;
    }
}
