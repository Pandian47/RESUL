import { AnnotationPreview, TempImage2 } from 'Assets/Images';
import { GetpopoverContentPlanner, PREVIEW_SOURCE } from 'Utils/modules/preview';
import { eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import Icon from 'Components/Icon/Icon';

import EmailListPreview from 'Pages/AuthenticationModule/Communication/Component/EmailListPreview/EmailListPreview';
import RSWebPreview from 'Pages/AuthenticationModule/Communication/Component/RSWebPreview';
import RSMobileListPreview from 'Pages/AuthenticationModule/Communication/Component/RSMobileListPreview';

const Preview = ({ channelImage, setShowModal, blastName, channelId, previewImage, scheduleDateTime, senderName, isCarousel, carouselJSON, header, footer, attachment, content, footerContent, notifications, notification, slides, contentJson }) => {
    const [isPreview, setIsPreview] = useState(false);
    return (
        <>
            {/* <img className="mobile-window" src={AnnotationPreview} /> */}
            <div
                className="image-modal-preview"
                onClick={() => {
                    setShowModal((pre) => ({ ...pre, modalStatus: true, modalInfo: channelImage }));
                    setIsPreview(true);
                }}
            >
                <Icon icon={eye_medium} size="md" id="rs_data_eye" />
                {channelId === 1 ? (
                    <EmailListPreview
                        data={{
                            content: content || channelImage,
                            footerContent: footerContent || '',
                            previewImage: previewImage,
                            showAsHtml: true,
                            isModalPreview: true,
                        }}
                    />
                ) : channelId === 8 ? (
                    Array.isArray(notifications) && notifications.length ? (
                        
                            <RSWebPreview
                                notifications={notifications}
                                previewImage={previewImage}
                                previewSource={PREVIEW_SOURCE.CSR}
                            />
                    
                    ) : notification ? (
                       
                            <RSWebPreview
                                notification={notification}
                                previewImage={previewImage}
                                previewSource={PREVIEW_SOURCE.CSR}
                            />
                       
                    ) : (
                        GetpopoverContentPlanner({ channelId, content: channelImage, senderName, attachment: attachment || previewImage, previewImage: attachment || previewImage, scheduleDate: scheduleDateTime, carouselJSON, isCarousel, header, footer, imagePath: previewImage, className: 'rs-listing-messaging-preview float-none mx-auto', previewSource: PREVIEW_SOURCE.CSR })
                    )
                ) : channelId === 14 ? (
                    Array.isArray(slides) && slides.length ? (
                        <div className='mobile tabs-content mx-auto position-relative'>
                            <RSMobileListPreview slides={slides} previewSource={PREVIEW_SOURCE.CSR} pushCardMainClassName={'channelAnalytics_preview'}/>
                        </div>
                    ) : (
                        GetpopoverContentPlanner({ channelId, content: channelImage, senderName, attachment: attachment || previewImage, previewImage: attachment || previewImage, scheduleDate: scheduleDateTime, carouselJSON, isCarousel, header, footer, imagePath: previewImage, className: 'rs-listing-messaging-preview float-none mx-auto', previewSource: PREVIEW_SOURCE.CSR })
                    )
                ) : (
                    GetpopoverContentPlanner({ channelId, content: channelImage, senderName, attachment: attachment || previewImage, previewImage: attachment || previewImage, scheduleDate: scheduleDateTime, carouselJSON, isCarousel, header, footer, imagePath: previewImage, contentJson, className: 'rs-listing-messaging-preview float-none mx-auto', previewSource: PREVIEW_SOURCE.CSR })
                )}
                {/* {['SMS', 'Mobile', 'Two-Way SMS', 'WhatsApp', 'Line', 'VMS'].includes(blastName) ? (
                    <div
                        className={`${
                            ['WhatsApp'].includes(blastName) ? 'rs-whatsapp-preview-box' : 'rs-mobile-preview-box'
                        }`}
                    >
                        <SmsPreview content={channelImage} />
                    </div>
                ) : (
                    <img alt={''} src={`data:image/jpeg;base64,${channelImage}`} className="mobile-window" />
                    // <img className="mobile-window" src={TempImage2} />
                )} */}
            </div>
        </>
    );
};

export default Preview;
