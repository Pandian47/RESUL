import { scolor1 } from 'Components/Skeleton/Components/constants';
import { truncateTitle } from 'Utils/modules/displayCore';
import { GetpopoverContentPlanner, PREVIEW_SOURCE } from 'Utils/modules/preview';
import { SUBJECT_LINE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { placeholderImage } from 'Assets/Images';
import RSModal from 'Components/RSModal';


import RSTooltip from 'Components/RSTooltip';
import EmailListPreview from 'Pages/AuthenticationModule/Communication/Component/EmailListPreview/EmailListPreview';
import RSWebPreview from 'Pages/AuthenticationModule/Communication/Component/RSWebPreview';
import RSMobileListPreview from 'Pages/AuthenticationModule/Communication/Component/RSMobileListPreview';
import { ChannelPreviewSkeleton } from 'Components/Skeleton/Skeleton';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
const PREVIEW_PANEL_HEIGHT = 330;

const PreviewModalPanel = ({ variant, children }) => (
    <div
        className="listing-preview-scroll listing-preview-skeleton px0 border-r10 skeleton-span-con position-relative"
        style={{
            height: PREVIEW_PANEL_HEIGHT,
            minHeight: PREVIEW_PANEL_HEIGHT,
            background: variant === 'empty' ? scolor1 : undefined,
            border: variant === 'empty' ? `1px solid ${scolor1}` : undefined,
            overflow: 'hidden',
        }}
    >
        {children}
    </div>
);

const ClickMapModal = ({ show, handleClose, previewImage, channelId, imagePath, scheduleDate, subject, carouselJSON, isCarousel, header, footer, senderName, footerContent, notifications, notification, slides, contentJson, isPreviewLoading = false }) => {
    const [previewImageFailed, setPreviewImageFailed] = useState(false);

    useEffect(() => {
        setPreviewImageFailed(false);
    }, [previewImage]);

    const hasPreviewImage = Boolean(previewImage && String(previewImage).trim());
    const hasOverviewPreviewContent = () => {
        if (channelId === 1) return hasPreviewImage;
        if (channelId === 8) {
            return (Array.isArray(notifications) && notifications.length > 0) || Boolean(notification) || hasPreviewImage;
        }
        if (channelId === 14) {
            return (Array.isArray(slides) && slides.length > 0) || hasPreviewImage;
        }
        if (channelId === 3) {
            return hasPreviewImage && !previewImageFailed;
        }
        return hasPreviewImage;
    };
    const previewSrc =
        !hasPreviewImage || previewImageFailed
            ? placeholderImage
            : previewImage?.startsWith?.('data:')
              ? previewImage
              : `data:image/jpeg;base64,${previewImage}`;

    return (
        <RSModal
            size={'lg'}
            show={show}
            handleClose={handleClose}
            header={'Preview'}
            className="pt15"
            bodyClassName="pt19"
            body={
                isPreviewLoading ? (
                    <PreviewModalPanel variant="loading">
                        <ChannelPreviewSkeleton />
                    </PreviewModalPanel>
                ) : !hasOverviewPreviewContent() ? (
                    <PreviewModalPanel variant="empty">
                        <NoDataAvailableRender className="nodata-skeleton-con" />
                    </PreviewModalPanel>
                ) : channelId === 8 ? (
                    <div className='analytics-modal-preview'>
                        {Array.isArray(notifications) && notifications.length ? (
                            <RSWebPreview
                                notifications={notifications}
                                previewImage={imagePath}
                                isAnalytics
                                previewSource={PREVIEW_SOURCE.DETAIL_ANALYTICS}
                            />
                        ) : notification ? (
                            <RSWebPreview
                                notifications={notifications}
                                previewSource={PREVIEW_SOURCE.DETAIL_ANALYTICS}
                            />
                        ) : (
                            <img
                                className="mx-auto d-block"
                                src={`data:image/jpeg;base64,${previewImage}`}
                                alt="Preview"
                            />
                        )}
                    </div>
                )
                    :
                    <Container >
                        <Row>
                            <Col>
                                {channelId === 1 ? (
                                    <>
                                        <div className="bg-tertiary-blue mb30">
                                            <span className="font-bold px10">{SUBJECT_LINE}:</span>
                                            {subject?.length > 95 ? (
                                                <RSTooltip className="d-inline-block" text={subject}>
                                                    {truncateTitle(subject, 95)}
                                                </RSTooltip>
                                            ) : (
                                                subject
                                            )}
                                        </div>
                                        <EmailListPreview
                                            data={{
                                                content: previewImage,
                                                footerContent: footerContent || '',
                                                previewImage: imagePath,
                                                showAsHtml: true,
                                                isModalPreview: true,
                                            }}
                                        />
                                    </>
                                ) : channelId === 8 ? (
                                    Array.isArray(notifications) && notifications.length ? (
                                        <RSWebPreview
                                            notifications={notifications}
                                            previewImage={imagePath}
                                            isAnalytics
                                            previewSource={PREVIEW_SOURCE.DETAIL_ANALYTICS}
                                        />
                                    ) : notification ? (
                                        <RSWebPreview notifications={notifications} previewSource={PREVIEW_SOURCE.DETAIL_ANALYTICS} />
                                    ) : (
                                        <img
                                            className="mx-auto d-block"
                                            src={`data:image/jpeg;base64,${previewImage}`}
                                            alt="Preview"
                                        />
                                    )
                                ) : channelId === 14 ? (
                                    Array.isArray(slides) && slides.length ? (
                                        <div className='mobile tabs-content mx-auto position-relative detailAnalytics'>
                                            <RSMobileListPreview slides={slides} previewSource={PREVIEW_SOURCE.DETAIL_ANALYTICS} />
                                        </div>
                                    ) : (
                                        GetpopoverContentPlanner({ channelId, content: previewImage, senderName, imagePath, previewImage, scheduleDate, carouselJSON, isCarousel: carouselJSON?.length > 0, header, footer, className: 'rs-listing-messaging-preview float-none mx-auto', previewSource: PREVIEW_SOURCE.DETAIL_ANALYTICS })
                                    )
                                ) : channelId === 3 ? (
                                    <img
                                        className="mx-auto d-block"
                                        src={previewSrc}
                                        alt="Preview"
                                        onError={(e) => {
                                            if (e.currentTarget.src !== placeholderImage) {
                                                setPreviewImageFailed(true);
                                            }
                                        }}
                                    />
                                ) : (
                                    GetpopoverContentPlanner({ channelId, content: previewImage, senderName, imagePath, previewImage, scheduleDate, carouselJSON, isCarousel: carouselJSON?.length > 0, header, footer, contentJson, className: 'rs-listing-messaging-preview float-none mx-auto', previewSource: PREVIEW_SOURCE.DETAIL_ANALYTICS })
                                )}
                            </Col>
                        </Row>
                    </Container>
            }
        // footer={<RSSecondaryButton onClick={() => handleClose(false)}>Close</RSSecondaryButton>}
        />
    );
};

export default ClickMapModal;
