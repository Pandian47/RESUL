import * as icons from 'Constants/GlobalConstant/Glyphicons';
import { listing_preview_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { CANCEL, EDIT, OK, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { Container, Col } from 'react-bootstrap';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import Icon from 'Components/Icon/Icon';
import { popupTemplateList } from './ChannelConst';

import RSWebPreview from 'Pages/AuthenticationModule/Communication/Component/RSWebPreview';
import RSMobileListPreview from 'Pages/AuthenticationModule/Communication/Component/RSMobileListPreview';
import EmailListPreview from 'Pages/AuthenticationModule/Communication/Component/EmailListPreview/EmailListPreview';
import { useSelector } from 'react-redux';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import { hasValidChannelStatus } from '../../constant';
import { ChannelPreviewSkeleton } from 'Components/Skeleton/Skeleton';

const ChannelContentPopup = ({
    show,
    popupMode,
    contentSettingJson,
    isPreviewLoading = false,
    onClose,
    handleSaveChannelContent,
    handleCreateChannelContent,
    handleChannelEditRedirect,
    currentActiveChannel = {},
    channelId = '',
}) => {
    const [name, setName] = useState('');
    const [updateTitle, setUpdateTitle] = useState('mobile_sms_large');
    const [phIcon, setPhIcon] = useState('');
    const { ChannelId, ContentThumbnailPath, DomId, ScheduleDate, ChannelDetailID, JsonType, subjectLine, senderName, content } =
        contentSettingJson;

    useEffect(() => {
        const resolvedChannelId = contentSettingJson.ChannelId || channelId;
        if (resolvedChannelId) {
            const { name, updateTitle, placeholderIcon } = popupTemplateList.filter(
                (item) => item?.channelId === resolvedChannelId,
            )?.[0] || {};
            setName(name);
            setUpdateTitle(updateTitle);
            setPhIcon(placeholderIcon);
        }
    }, [contentSettingJson.ChannelId, channelId]);

    const handleIconStatus = () => {
        const isExcute =
            hasValidChannelStatus(currentActiveChannel.statusId) ||
            new Date() >= new Date(currentActiveChannel?.ScheduleDate);
        if (!isExcute) {
            return {
                icon: `${pencil_edit_medium} icon-md`,
                tooltipText: EDIT,
            };
        } else {
            return {
                icon: `${listing_preview_medium} icon-md`,
                tooltipText: VIEW,
            };
        }
    };

    return (
        <RSModal
            size={'md'}
            show={show}
            handleClose={() => {
                if (isPreviewLoading) return;
                onClose(false);
            }}
            bodyClassName="custom_modal_tableTop"
            header={
                (popupMode === 'edit' && ChannelDetailID) || isPreviewLoading ? (
                    <div className="d-flex align-items-center justify-content-between">
                        <div>{updateTitle} </div>
                    </div>
                ) : (
                    <div className="d-flex align-items-center">
                        <div>{name} </div>
                    </div>
                )
            }
            body={
                <Container>
                    {!isPreviewLoading && (
                        <div className='d-flex align-items-center justify-content-end mb10'>
                            <Icon
                                icon={handleIconStatus().icon}
                                tooltip={handleIconStatus().tooltipText}
                                mainClass="mr45"
                                callBack={handleChannelEditRedirect}
                            />
                        </div>
                    )}
                    <div className={`${ChannelId !== 'ch008' ? 'mdc-preview-content': 'mdc-webframe-popup-new' } ${ChannelId === 'ch0014' ? 'mobile-mdc-preview' : ''}`}>
                        {isPreviewLoading ? (
                            <ChannelPreviewSkeleton />
                        ) : popupMode === 'edit' && ChannelDetailID ? (
                            <DisplayContent
                                ChannelId={ChannelId}
                                ContentThumbnailPath={content?.length > 0 ? content : ContentThumbnailPath}
                                ScheduleDate={ScheduleDate}
                                Content={contentSettingJson}
                                subjectLine={subjectLine}
                                senderName={senderName}
                            />
                        ) : (
                            <div>
                                <Icon
                                    icon={icons[phIcon]}
                                    //callBack={handleCreateChannelContent}
                                    size={'lg'}
                                    mainClass={'mdcDragContentBlockCSS'}
                                />
                                <RSPrimaryButton onClick={handleCreateChannelContent} className={'float-end mt20'}>
                                    Create content
                                </RSPrimaryButton>
                            </div>
                        )}
                    </div>
                </Container>
            }
            footerClassName="custom_modal_footer_button"
            footer={
                <Fragment>
                    <RSSecondaryButton
                        onClick={() => {
                            onClose(false);
                        }}
                        disabled={isPreviewLoading}
                    >
                        {CANCEL}
                    </RSSecondaryButton>

                    <RSPrimaryButton
                        onClick={handleSaveChannelContent}
                        disabledClass={`${!ChannelDetailID || isPreviewLoading ? 'pe-none click-off' : ''}`}
                        disabled={isPreviewLoading}
                    >
                        {OK}
                    </RSPrimaryButton>
                </Fragment>
            }
        ></RSModal>
    );
};

export default ChannelContentPopup;

const DisplayContent = ({ ChannelId, ContentThumbnailPath, ScheduleDate, Content, subjectLine, senderName = '' }) => {
    const mdcType = Content?.JsonType || '';
    // console.log(ChannelId, 'senderName: ', senderName);
    const [waLogo, setLogo] = useState(`https://dwiz.resul.io/${Content['AccountLogo']}`);
    const [blastScheduleDate, setBlastScheduleDate] = useState('');
    const [imageError, setImageError] = useState(false);
    const { clientId } = useSelector(({ globalstate }) => globalstate);
    useEffect(() => {
        if (typeof ScheduleDate == 'string' && ScheduleDate.includes(',')) {
            let tmpScheduleDate = ScheduleDate.split(',');
            const [date, month, year, hours, minutes] = tmpScheduleDate;
            let tmpDate = new Date(year, month - 1, date, hours, minutes);
            setBlastScheduleDate(tmpDate);
        } else {
            setBlastScheduleDate(ScheduleDate);
        }
    }, [ScheduleDate]);
    const { firstName } = getUserDetails();

    switch (ChannelId) {
        case 'ch002':
        case 'ch0026':
            return (
                <Col sm="12">
                    <RSMobilePreview
                        channel="sms"
                        previewSource={PREVIEW_SOURCE.MDC_PREVIEW}
                        content={ContentThumbnailPath}
                        senderName={senderName || firstName || ''}
                        className="mx-auto float-none"
                        scheduleDate={blastScheduleDate}
                    />
                </Col>
            );
        case 'ch0041': {
            const rcsContent = (ContentThumbnailPath != null && String(ContentThumbnailPath).trim() !== '')
                ? ContentThumbnailPath
                : (Content?.ContentThumbnailPath != null && String(Content.ContentThumbnailPath).trim() !== '' ? Content.ContentThumbnailPath : '');
            const rcsContentJsonRaw = Content?.contentJson ?? Content?.contentJSON;
            const rcsContentJsonStr = rcsContentJsonRaw != null
                ? (typeof rcsContentJsonRaw === 'string' ? rcsContentJsonRaw.trim() : JSON.stringify(rcsContentJsonRaw))
                : '';
            const rcsCarouselRaw = Content?.carouselJSON;
            const rcsCarouselJSON = rcsCarouselRaw != null
                ? (typeof rcsCarouselRaw === 'string' ? rcsCarouselRaw.trim() : JSON.stringify(rcsCarouselRaw))
                : '';
            return (
                <Col sm="12">
                    <RSMobilePreview
                        channel="rcs"
                        previewSource={PREVIEW_SOURCE.MDC_PREVIEW}
                        content={rcsContent || undefined}
                        senderName={Content?.ClientName || firstName || ''}
                        className="mx-auto float-none"
                        scheduleDate={blastScheduleDate}
                        contentJson={rcsContentJsonStr ||  undefined}
                        carouselJSON={rcsCarouselJSON ||  undefined}
                        isCarousel={!!Content?.isCarousel}
                    />
                </Col>
            );
        }
        case 'ch0021': {
            const contentJsonValue = Content?.contentJson ?? Content?.contentJSON;
            const contentJsonStr = typeof contentJsonValue === 'string' ? contentJsonValue : (contentJsonValue != null ? JSON.stringify(contentJsonValue) : '');
            return (
                <RSMobilePreview
                    channel="whatsapp"
                    previewSource={PREVIEW_SOURCE.MDC_PREVIEW}
                    content={Content?.ContentThumbnailPath}
                    senderName={senderName}
                    className="mx-auto float-none"
                    scheduleDate={ScheduleDate}
                    isCarousel={Content?.isCarousel}
                    carouselJSON={Content?.carouselJSON}
                    header={Content?.header}
                    footer={Content?.footer}
                    mdcType={mdcType}
                    previewImage={Content?.WaMediaContent?.[0]?.url}
                    contentJson={contentJsonStr || undefined}
                    mediaType={Content?.mediaType}
                    locationDetails={Content?.locationDetails}
                    locationName={Content?.locationName}
                    locationAddress={Content?.locationAddress}
                />
            );
        }

        case 'ch001': {
            const isBase64 = typeof ContentThumbnailPath === 'string' && ContentThumbnailPath.startsWith('/');

            return (
                <Col sm="12">
                    <div className="">
                        <div className="sci-center  mb10">
                            <small className="text-center d-flex justify-content-center align-items-center">
                                {subjectLine}
                            </small>
                        </div>
                        <div className="text-center">
                            <EmailListPreview
                                data={{
                                    content: ContentThumbnailPath,
                                    showAsHtml: !isBase64,
                                    isModalPreview: true,
                                }}
                            />
                        </div>
                    </div>
                </Col>
            );
        }
        case 'ch0034':
            return (
                <Col sm="12">
                    <div className="">
                        <div className="text-center">
                            <img src={`data:image/png;base64, ${ContentThumbnailPath}`} />
                        </div>
                    </div>
                </Col>
            );
        case 'ch008': {
            // Web push preview (desktop)
            const notifications = Array.isArray(Content?.content) ? Content.content : [];
            return (
                    <RSWebPreview notifications={notifications} previewSource={PREVIEW_SOURCE.MDC_PREVIEW} />
            );
        }
        case 'ch0014': {
            // Mobile push preview (android/iOS style)
            const notifications = Array.isArray(Content?.content) ? Content.content : [];
            return (
                <Col sm="12" className="mobile-prev mobile-mdc-live-preview mobile tabs-content">
                    <RSMobileListPreview slides={notifications} previewSource={PREVIEW_SOURCE.MDC_PREVIEW} />
                </Col>
            );
        }
        case 'ch0025':
            if (ContentThumbnailPath?.length < 1000)
                return (
                    <Col sm="12">
                        <div className="sms-prev-box">
                            <div className="contact-info">
                                <span className="sci-left">&lt; Back</span>
                                <div className="sci-center">+919176666358</div>
                                <span className="sci-right">Contact</span>
                            </div>
                            <div className="message-box">{` ${ContentThumbnailPath}`}</div>
                            <div className="sci-center">
                                <small className="text-center mt10">
                                    {/* {blastScheduleDate ? getfullFormat(blastScheduleDate) : ''} */}
                                    {blastScheduleDate ? getUserCurrentFormat(blastScheduleDate)?.dateTimeFormat : ''}
                                </small>
                            </div>
                        </div>
                    </Col>
                );

            return (
                <Col sm="12">
                    <div className="">
                        <div className="text-center">
                            <img src={`data:image/png;base64, ${ContentThumbnailPath}`} />
                        </div>
                    </div>
                </Col>
            );
        case 'ch003':
            return (
                <Col sm="12">
                    <div className="">
                        <div className="text-center">
                            <img src={`data:image/png;base64, ${ContentThumbnailPath}`} />
                        </div>
                    </div>
                </Col>
            );
    }
};
