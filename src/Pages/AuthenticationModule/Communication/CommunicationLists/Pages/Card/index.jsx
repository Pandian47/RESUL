import { getChannelId, getChannelPaidMediaId, getChannelSocialId, getNameType } from 'Utils/modules/communicationChannels';
import { getStatus } from 'Utils/modules/communicationStatus';
import { renderCommunicationListingTags } from 'Utils/modules/display';
import { encryptWithAES } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { ARE_YOU_SURE_ARCHIVE, COMMUNICATION_TYPE, CONVERSION, CREATED_ON, DELIVERY_METHOD, ENGAGEMENT, INFO, OK, REACH, TOTAL_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_medium, circle_info_mini, menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import _get from 'lodash/get';

import { Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import RSTooltip from 'Components/RSTooltip';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import ResTemplateCardShell from 'CommonComponents/ResTemplateCard';

import Carousel from 'react-bootstrap/Carousel';
import { duplicateGalleryCommunication, getGalleryDetails } from 'Reducers/communication/gallery/request';
import { deleteArchiveCommunication, unarchiveCommunication } from 'Reducers/communication/listing/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { GallerySelectModal } from './GallerySelectModal';
import { getGoalType } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';
import { availableTabs } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/constant';
import { setTabforEdit, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import { handleCampaignStatus } from 'Reducers/communication/createCommunication/plan/request';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import SocialPostListPagePreview from 'Pages/AuthenticationModule/Communication/Component/SocialPostListPagePreview/SocialPostListPagePreview';
import RSWebPreview from 'Pages/AuthenticationModule/Communication/Component/RSWebPreview';
import RSMobileListPreview from 'Pages/AuthenticationModule/Communication/Component/RSMobileListPreview';
import EmailListPreview from 'Pages/AuthenticationModule/Communication/Component/EmailListPreview/EmailListPreview';
import DuplicateModal from '../Listings/Components/DuplicateModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { resolveGalleryBannerSrc } from '../../../utils/galleryBannerMedia';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import TruncateCell from 'Components/RSKendoGrid/TruncateCell';

const GALLERY_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const parseGalleryContentThumbnail = (contentThumbnail) => {
    if (!contentThumbnail || typeof contentThumbnail !== 'string') return null;
    const trimmed = contentThumbnail.trim();
    if ((trimmed.startsWith('[') || trimmed.startsWith('{')) && (trimmed.endsWith(']') || trimmed.endsWith('}'))) {
        try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return null;
        }
    }
    return null;
};

const isHtmlContent = (str) => {
    if (!str || typeof str !== 'string') return false;
    const t = str.trim();
    return t.startsWith('<') && (t.includes('<html') || t.includes('<div') || t.includes('<body') || t.includes('<img'));
};

const Card = ({ list, handleInfoGallery, infoData, infoFactLoading = false, currentChannelId, onGalleryListRefresh }) => {
    const navigate = useNavigate();
    const colorRef = useRef();
    const channelId = list?.channelId ?? currentChannelId;
    const dispatch = useDispatch();

    const [detailedInfoON, detailedInfoOFF] = useState(false);
    const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
    const [duplicateModal, setDuplicateModal] = useState({
        show: false,
        selectedCommunication: {},
    });
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const galleryEditLoader = useApiLoader({ autoFetch: false, loaderConfig: GALLERY_FIELD_LOADER_CONFIG });

    const imgRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    useEffect(() => {
        const checkImageHeight = () => {
            if (imgRef.current) {
                const imgHeight = imgRef.current.height || imgRef.current.naturalHeight || imgRef.current.offsetHeight;
                setShouldScroll(imgHeight >= 240);
            }
        };

        const img = imgRef.current;
        if (img) {
            img.addEventListener('load', checkImageHeight);
            if (img.complete) {
                checkImageHeight();
            }
        }

        return () => {
            if (img) {
                img.removeEventListener('load', checkImageHeight);
            }
        };
    }, [list?.channelDetails]);

    const { className, status } = getStatus(list?.statusId);
    const [popupStatus, setPopupStatus] = useState({
        status: false,
        popupValue: [],
    });
    const adjustedStatus = status === 'In progress' ? 'Inprogress' : status === 'Alert' || status === 'alert' ? 'alerted' : status;

    const scrollList = list?.campaigns?.reduce((res, el, i) => {
        if (i % 1 === 0) {
            res[res?.length] = el;
        } else {
            res[res?.length - 1] = [...res[res?.length - 1], el];
        }
        return res;
    }, []);

    useEffect(() => {
        window.addEventListener('mousedown', handlemouseDownEvent);
        return () => {
            window.removeEventListener('mousedown', handlemouseDownEvent);
        };
    }, []);

    function handlemouseDownEvent(e) {
        if (colorRef?.current && !colorRef.current?.contains(e.target)) {
            detailedInfoOFF(false);
        }
    }
    const hasMultipleCarousels = () => {
        try {
            const contentThumbnail = list?.campaigns?.[0]?.contentThumbnail;
            if (typeof contentThumbnail === 'string') {
                const parsed = JSON.parse(contentThumbnail);
                return Array.isArray(parsed) && parsed.length > 1;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    const getCarouselData = () => {
        try {
            const contentThumbnail = list?.campaigns?.[0]?.contentThumbnail;
            if (typeof contentThumbnail === 'string') {
                const parsed = JSON.parse(contentThumbnail);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (error) {
            return [];
        }
    };

    const isCarousal = scrollList?.length > 1 || (hasMultipleCarousels() && list?.deliveryMethod === 'S' && list?.channelId === 41);

    const handleSelectedDetails = async (itemSelected) => {
        let payload = {
            departmentId,
            clientId,
            userId,
            campaignId: list?.campaignId,
            blastguid: itemSelected.blastScheduleGuid,
        };
        const response = await dispatch(getGalleryDetails({ payload }));
        if (response?.status) {
            setPopupStatus((pre) => ({ ...pre, status: true, popupValue: response?.data }));
        } else {
        }
    };



    const handleDuplicate = async (newCampaignName) => {
        setIsDuplicating(true);
        try {
            const payload = {
                userId,
                clientId,
                departmentId,
                campaignId: list?.campaignId,
                campaignName: newCampaignName || '',
            };
            const response = await dispatch(
                duplicateGalleryCommunication({
                    payload,
                }),
            );
            if (response?.status) {
                setDuplicateModal({ show: false, selectedCommunication: {} });
                navigate('.', {
                    state: {
                        index: 0,
                    },
                });
            }
        } finally {
            setIsDuplicating(false);
        }
    };
    const disbledItems = (() => {
        if (list?.deliveryMethod === 'M') {
            if (list?.statusId == 9 || list?.statusId == 5) {
                return ['Edit', 'Duplicate'];
            }
            return ['Duplicate'];
        } else if (list?.statusId == 9) {
            return ['Edit'];
        } else if (list?.statusId === 52) {
            return ['Duplicate'];
        }
        return [];
    })();

    const statusId = list?.statusId;
    const extraArchiveOptions = [];
    if (statusId === 6 || statusId === 9 || statusId === 26) {
        extraArchiveOptions.push('Archive');
    } else if (statusId === 70) {
        extraArchiveOptions.push('Unarchive');
    }
    const dropdownData = ['Edit', 'Duplicate', ...extraArchiveOptions];
    const canArchiveAsCreator =
        list?.createdById != null &&
        userId != null &&
        Number(list?.createdById) === Number(userId);
    const archiveDisbleItems = [];
    if (!canArchiveAsCreator) {
        if (extraArchiveOptions.includes('Archive')) {
            archiveDisbleItems.push('Archive');
        }
        if (extraArchiveOptions.includes('Unarchive')) {
            archiveDisbleItems.push('Unarchive');
        }
    }
    const allDisbleItems = [...disbledItems, ...archiveDisbleItems];

    const handleConfirmArchive = async () => {
        const archivePayload = {
            userId,
            clientId,
            departmentId,
            campaignId: list?.campaignId,
        };
        const response = await dispatch(deleteArchiveCommunication({ payload: archivePayload }));
        setShowArchiveModal(false);
        if (response?.status && typeof onGalleryListRefresh === 'function') {
            onGalleryListRefresh();
        }
    };

    const isPerSlideInfo = hasMultipleCarousels() && list?.deliveryMethod === 'S';
    const hasGalleryBody = scrollList?.length || isPerSlideInfo;

    const handleCardInfoOpen = () => {
        const selectedItem =
            scrollList?.[activeCarouselIndex] ??
            scrollList?.[0] ??
            (isPerSlideInfo
                ? getCarouselData()?.[activeCarouselIndex] ?? getCarouselData()?.[0]
                : null);
        if (!selectedItem) return;

        handleInfoGallery(selectedItem, list?.campaignId, list?.channelId, list?.subChannelId);
        detailedInfoOFF(true);
    };

    const galleryBodyContent = hasGalleryBody ? (
        <Carousel
            className={`gaugeslider-wrapper ${detailedInfoON ? 'galleryCarouselActive' : ''}`}
            indicators={isCarousal}
            indicatorLabels={isCarousal}
            controls={isCarousal}
            interval={null}
            activeIndex={activeCarouselIndex}
            onSelect={(nextIndex) => setActiveCarouselIndex(nextIndex)}
        >
            {isPerSlideInfo
                ? getCarouselData()?.map((carouselItem, index) => (
                      <Carousel.Item key={`carousel-${index}`}>
                          <div className={`gl-body listing-preview-scroll ${list?.channelId === 1 ? 'p0 cp' : ''} `}>
                              <div className="gl-img-scroll-container">
                                  <div
                                      className={`${list?.channelId === 21 ? 'whatsapp-bg-wrapper' : list?.channelId === 41 ? '' : 'gl-img'} ${shouldScroll ? 'scrollable' : 'non-scrollable'}`}
                                  >
                                      <RSMobilePreview
                                          channel="rcs"
                                          previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                          content={JSON.stringify([carouselItem])}
                                          senderName={list?.smssenderName}
                                          scheduleDate={list?.scheduledDate}
                                          className="gl-body font-xxs border-0 p0"
                                      />
                                  </div>
                              </div>
                          </div>
                          <div
                              className={`${detailedInfoON ? 'd-none' : ''} p5  gl-bottom`}
                              onClick={() => {
                                  const mockCampaignItem = {
                                      ...carouselItem,
                                      blastScheduleGuid:
                                          list?.campaigns?.[0]?.blastScheduleGuid || `carousel-${index}`,
                                      campaignGuid:
                                          list?.campaigns?.[0]?.campaignGuid || `carousel-${index}`,
                                      campaignId: list?.campaignId,
                                      contentThumbnail: JSON.stringify([carouselItem]),
                                      isCarousel: true,
                                      carouselIndex: index,
                                  };
                                  handleInfoGallery(
                                      mockCampaignItem,
                                      list?.campaignId,
                                      list?.channelId,
                                      list?.subChannelId,
                                  );
                                  detailedInfoOFF(true);
                              }}
                          >
                              <RSTooltip position="top" text={INFO} className="lh0">
                                  <i
                                      className={`${circle_info_medium} icon-md primary-color ${list?.channelId === 1 ? 'bg-white border-r50' : ''}`}
                                  />
                              </RSTooltip>
                          </div>
                      </Carousel.Item>
                  ))
                : scrollList?.map((selecteditems, slideIndex) => (
                      <Carousel.Item key={selecteditems?.blastScheduleGuid}>
                          <div
                              className={`gl-body listing-preview-scroll ${[2, 21, 14, 8, 41]?.includes(list?.channelId) ? 'border-0' : ''} ${list?.channelId === 1 ? 'p0 cp' : list?.channelId === 7 ? 'border-0 p0' : ''} `}
                              onClick={() => {
                                  list?.channelId === 1 && handleSelectedDetails(selecteditems);
                              }}
                          >
                              <div className="gl-img-scroll-container">
                                  <div
                                      className={`${list?.channelId === 21 ? 'whatsapp-bg-wrapper' : list?.channelId === 41 || list?.channelId === 7 ? '' : 'gl-img'} ${shouldScroll ? 'scrollable' : 'non-scrollable'} ${list?.channelId === 2 ? 'd-block' : ''}`}
                                  >
                                      {list?.channelId === 2 || list?.channelId === 26
                                          ? (() => {
                                                const row = Array.isArray(selecteditems)
                                                    ? selecteditems[0]
                                                    : selecteditems;
                                                const bannerSrc = resolveGalleryBannerSrc(
                                                    row?.imagePath,
                                                    row?.contentThumbnail,
                                                );
                                                return (
                                                    <RSMobilePreview
                                                        channel="sms"
                                                        previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                        content={row?.contentThumbnail}
                                                        senderName={list?.smssenderName}
                                                        scheduleDate={list?.scheduledDate}
                                                        imagePath={bannerSrc}
                                                        className="gl-body font-xxs border-0 p0"
                                                    />
                                                );
                                            })()
                                          : list?.channelId === 21
                                            ? (() => {
                                                  const row = Array.isArray(selecteditems)
                                                      ? selecteditems[0]
                                                      : selecteditems;
                                                  const bannerSrc = resolveGalleryBannerSrc(
                                                      row?.imagePath,
                                                      row?.contentThumbnail,
                                                  );
                                                  return (
                                                      <RSMobilePreview
                                                          channel="whatsapp"
                                                          previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                          content={row?.contentThumbnail}
                                                          senderName={list?.smssenderName}
                                                          scheduleDate={list?.scheduledDate}
                                                          imagePath={bannerSrc}
                                                          className="gl-body font-xxs border-0 p0"
                                                          carouselJSON={
                                                              row?.carouselJSON || row?.contentThumbnail
                                                          }
                                                          isCarousel={row?.isCarousel}
                                                          smsContent={row?.smsContent}
                                                          header={row?.header}
                                                          footer={row?.footer}
                                                          contentJson={row?.contentJSON}
                                                      />
                                                  );
                                              })()
                                            : list?.channelId === 7
                                              ? (() => {
                                                    const campaigncontent = Array.isArray(selecteditems)
                                                        ? selecteditems[0]?.campaigncontent
                                                        : selecteditems?.campaigncontent;
                                                    let parsedContent = campaigncontent || '';
                                                    let parsedPostName = '';

                                                    if (campaigncontent) {
                                                        const campaignText = String(campaigncontent);
                                                        const postAndContentMatch = campaignText.match(
                                                            /postName\s*:\s*([\s\S]*?)(?:\s*_\s*)?content\s*:\s*([\s\S]*)$/i,
                                                        );

                                                        if (postAndContentMatch) {
                                                            parsedPostName = (postAndContentMatch[1] || '').trim();
                                                            parsedContent = (postAndContentMatch[2] || '').trim();
                                                        } else {
                                                            const postNameMatch =
                                                                campaignText.match(/postName\s*:\s*(.+)$/i);
                                                            const contentMatch =
                                                                campaignText.match(/content\s*:\s*([\s\S]*)$/i);

                                                            if (postNameMatch?.[1]) {
                                                                parsedPostName = postNameMatch[1].trim();
                                                            }

                                                            if (contentMatch?.[1]) {
                                                                parsedContent = contentMatch[1].trim();
                                                            }
                                                        }
                                                    }

                                                    const socialItem = Array.isArray(selecteditems)
                                                        ? selecteditems[0]
                                                        : selecteditems;
                                                    return (
                                                        <SocialPostListPagePreview
                                                            data={{
                                                                socialPostChannelId: list?.subChannelId,
                                                                content: parsedContent,
                                                                postName: parsedPostName,
                                                                imageUrl: socialItem?.imagePath,
                                                                imagePath: socialItem?.imagePath,
                                                                contentThumbnail: socialItem?.contentThumbnail,
                                                                scheduleTime: list?.scheduledDate,
                                                                isGallery: true,
                                                            }}
                                                        />
                                                    );
                                                })()
                                              : list?.channelId === 41 ? (
                                                    <RSMobilePreview
                                                        channel="rcs"
                                                        previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                        content={list?.campaigns?.[slideIndex]?.contentThumbnail}
                                                        senderName={list?.smssenderName}
                                                        scheduleDate={list?.scheduledDate}
                                                        className="gl-body font-xxs border-0 p0"
                                                    />
                                                ) : channelId === 8
                                                  ? (() => {
                                                        const item = Array.isArray(selecteditems)
                                                            ? selecteditems[0]
                                                            : selecteditems;
                                                        const campaignRaw = item?.campaigncontent;
                                                        const campaignHtml =
                                                            typeof campaignRaw === 'string'
                                                                ? campaignRaw.trim()
                                                                : '';
                                                        const hasCampaignHtml =
                                                            campaignHtml.length > 0 &&
                                                            /<[a-z!?]/i.test(campaignHtml);
                                                        const raw = item?.contentThumbnail;
                                                        const parsed = parseGalleryContentThumbnail(raw);
                                                        let notifications = Array.isArray(parsed)
                                                            ? parsed.map((n) => ({
                                                                  title: n?.title ?? n?.heading ?? '',
                                                                  content:
                                                                      n?.contentType === 'Z'
                                                                          ? (n?.content ??
                                                                            n?.body ??
                                                                            n?.textContent ??
                                                                            '')
                                                                          : '',
                                                                  webMediaURL:
                                                                      n?.webMediaURL ?? n?.imageUrl ?? '',
                                                                  pushImagePath:
                                                                      n?.pushImagePath ?? n?.imagePath ?? '',
                                                                  contentType: n?.contentType,
                                                              }))
                                                            : [];
                                                        if (notifications.length === 0 && raw != null) {
                                                            notifications = [
                                                                {
                                                                    title: '',
                                                                    content: hasCampaignHtml
                                                                        ? campaignHtml
                                                                        : isHtmlContent(raw)
                                                                          ? raw
                                                                          : '',
                                                                    contentType:
                                                                        hasCampaignHtml || isHtmlContent(raw)
                                                                            ? 'Z'
                                                                            : undefined,
                                                                    pushImagePath:
                                                                        hasCampaignHtml || isHtmlContent(raw)
                                                                            ? undefined
                                                                            : raw,
                                                                    webMediaURL:
                                                                        hasCampaignHtml || isHtmlContent(raw)
                                                                            ? undefined
                                                                            : raw,
                                                                },
                                                            ];
                                                        } else if (
                                                            notifications.length === 0 &&
                                                            hasCampaignHtml
                                                        ) {
                                                            notifications = [
                                                                {
                                                                    title: '',
                                                                    content: campaignHtml,
                                                                    contentType: 'Z',
                                                                    pushImagePath: undefined,
                                                                    webMediaURL: undefined,
                                                                },
                                                            ];
                                                        }
                                                        return (
                                                            <RSWebPreview
                                                                notifications={notifications}
                                                                previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                            />
                                                        );
                                                    })()
                                                  : channelId === 9 || channelId === 14
                                                    ? (() => {
                                                          const raw = Array.isArray(selecteditems)
                                                              ? selecteditems[0]?.contentThumbnail
                                                              : selecteditems?.contentThumbnail;
                                                          const parsed = parseGalleryContentThumbnail(raw);
                                                          let slides = Array.isArray(parsed)
                                                              ? parsed.map((s) => ({
                                                                    title: s?.title ?? s?.heading ?? '',
                                                                    subTitle: s?.subTitle ?? s?.subtitle ?? '',
                                                                    content:
                                                                        s?.contentType === 'Z'
                                                                            ? (s?.content ??
                                                                              s?.edmContent ??
                                                                              s?.body ??
                                                                              s?.textContent ??
                                                                              '')
                                                                            : (s?.content ??
                                                                              s?.body ??
                                                                              s?.textContent ??
                                                                              ''),
                                                                    contentBgColour: s?.contentBgColour,
                                                                    contentTextColour: s?.contentTextColour,
                                                                    titleColor: s?.titleColor,
                                                                    isInteractivebuttonEnabled:
                                                                        s?.isInteractivebuttonEnabled,
                                                                    interactiveCustParameter:
                                                                        s?.interactiveCustParameter,
                                                                    interactivebuttonValue:
                                                                        s?.interactivebuttonValue,
                                                                    interactiveCustParameter2:
                                                                        s?.interactiveCustParameter2,
                                                                    interactivebuttonValue2:
                                                                        s?.interactivebuttonValue2,
                                                                    interactivebuttonTypes:
                                                                        s?.interactivebuttonTypes,
                                                                    interactivebuttonTypes2:
                                                                        s?.interactivebuttonTypes2,
                                                                    caBgColour: s?.caBgColour,
                                                                    caTextColour: s?.caTextColour,
                                                                    caBgColour2: s?.caBgColour2,
                                                                    caTextColour2: s?.caTextColour2,
                                                                }))
                                                              : [];
                                                          if (slides.length === 0 && raw != null) {
                                                              slides = [
                                                                  {
                                                                      title: '',
                                                                      subTitle: '',
                                                                      content: isHtmlContent(raw) ? raw : '',
                                                                      contentType: isHtmlContent(raw)
                                                                          ? 'Z'
                                                                          : undefined,
                                                                      contentThumbnail: raw,
                                                                      pushImagePath: raw,
                                                                      mobMediaURL: raw,
                                                                      webMediaURL: raw,
                                                                  },
                                                              ];
                                                          }
                                                          return (
                                                              <RSMobileListPreview
                                                                  slides={slides}
                                                                  previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                              />
                                                          );
                                                      })()
                                                    : list?.channelId === 1
                                                      ? (() => {
                                                            const item = Array.isArray(selecteditems)
                                                                ? selecteditems[0]
                                                                : selecteditems;
                                                            const campaignRaw = item?.campaigncontent;
                                                            const campaignHtml =
                                                                typeof campaignRaw === 'string'
                                                                    ? campaignRaw.trim()
                                                                    : '';
                                                            const useHtmlIframe =
                                                                campaignHtml.length > 0 &&
                                                                /<[a-z!?]/i.test(campaignHtml);
                                                            const thumb = item?.contentThumbnail ?? '';
                                                            const previewImage =
                                                                (item?.imagePath &&
                                                                    String(item.imagePath).trim()) ||
                                                                (item?.attachment &&
                                                                    String(item.attachment).trim()) ||
                                                                '';
                                                            return (
                                                                <EmailListPreview
                                                                    data={{
                                                                        content: useHtmlIframe
                                                                            ? campaignHtml
                                                                            : thumb,
                                                                        footerContent: '',
                                                                        previewImage,
                                                                        showAsHtml: useHtmlIframe,
                                                                        isModalPreview: true,
                                                                    }}
                                                                />
                                                            );
                                                        })()
                                                      : (
                                                            <img
                                                                ref={imgRef}
                                                                alt={selecteditems.campaignName}
                                                                src={
                                                                    selecteditems.contentThumbnail !== ''
                                                                        ? `data:image/jpeg;base64,${selecteditems.contentThumbnail}`
                                                                        : ''
                                                                }
                                                                onLoad={() => {
                                                                    if (imgRef.current) {
                                                                        const imgHeight =
                                                                            imgRef.current.naturalHeight ||
                                                                            imgRef.current.offsetHeight;
                                                                        setShouldScroll(imgHeight >= 240);
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                  </div>
                              </div>
                          </div>
                      </Carousel.Item>
                  ))}
        </Carousel>
    ) : null;

    return (
        <>
            <Col sm={3} ref={colorRef}>
                <ResTemplateCardShell
                    wrapCol={false}
                    col={3}
                    variant="gallery"
                    statusClass={adjustedStatus.toLowerCase()}
                    cardOverlay={
                        galleryEditLoader.isLoading ? (
                            <div className="gallery-list__field-loader" aria-hidden="true">
                                <span className="segment_loader" />
                            </div>
                        ) : null
                    }
                    headerMeta={
                        <>
                            {CREATED_ON}:{' '}
                            <span className="rct-date">
                                {getUserCurrentFormat(list?.createdDate)?.dateFormat}
                            </span>
                        </>
                    }
                    moreIcon={
                        <BootstrapDropdown
                            data={dropdownData}
                            flatIcon
                            alignRight
                            defaultItem={
                                <i className={`${menu_dot_medium} color-primary-blue icon-md`} />
                            }
                            showUpdate={false}
                            className="no_caret"
                            disbleItems={allDisbleItems}
                            onSelect={async (action) => {
                                if (allDisbleItems.includes(action)) {
                                    return;
                                }
                                const payload = {
                                    userId,
                                    clientId,
                                    departmentId,
                                    campaignId: list?.campaignId,
                                };
                                if (action === 'Duplicate') {
                                    setDuplicateModal({ show: true, selectedCommunication: list });
                                } else if (action === 'Archive') {
                                    setShowArchiveModal(true);
                                } else if (action === 'Unarchive') {
                                    const response = await dispatch(
                                        unarchiveCommunication({ payload }),
                                    );
                                    if (response?.status && typeof onGalleryListRefresh === 'function') {
                                        onGalleryListRefresh();
                                    }
                                } else {
                                    const isEditable =
                                        list?.statusId !== 9 &&
                                        list?.statusId !== 5 &&
                                        list?.statusId !== 20 &&
                                        list?.statusId !== 27 &&
                                        list?.statusId !== 26 &&
                                        list?.statusId !== 51 &&
                                        list?.statusId !== 52;

                                    if (galleryEditLoader.isFetching) return;

                                    galleryEditLoader.refetch({
                                        fetcher: async () => {
                                            await handleCampaignStatus(
                                                payload,
                                                list?.campaignId,
                                                dispatch,
                                                false,
                                            );
                                            const state = {
                                                campaignId: list?.campaignId,
                                                campaignType: _get(list, 'deliveryMethod', ''),
                                                channels: _get(list, 'channelIds', []),
                                                startDate: _get(list, 'startDate', ''),
                                                endDate: _get(list, 'endDate', ''),
                                                campaignName: _get(list, 'campaignName', ''),
                                                communicationType: list?.attributeName,
                                                primaryGoal: getGoalType(_get(list, 'goal', 0)),
                                                analyticsTypes: _get(list, 'analyticsTypeIs', []),
                                                editSourceChannelId: Number(list?.channelId) || 0,
                                                editSourceSubChannelId: Number(list?.subChannelId) || 0,
                                                currentIndex: _get(list, 'channelId', 0) === 8 ? 0 : 1,
                                                dynamicListId: list?.dynamicListId || 0,
                                                statusId: list?.statusId || null,
                                                campaignStatusId: list?.statusId || null,
                                                isEditable: isEditable,
                                            };
                                            const encryptState = encodeURIComponent(
                                                encryptWithAES(
                                                    JSON.stringify(state).replace(/\+/g, '%2B'),
                                                ),
                                            );
                                            if (_get(list, 'deliveryMethod', '') === 'M') {
                                                navigate(`/communication/mdc-workflow?q=${encryptState}`);
                                            } else {
                                                const currTab =
                                                    list?.channelId === 7
                                                        ? getChannelSocialId(list?.subChannelId)?.tabName
                                                        : list?.channelId === 10
                                                          ? getChannelPaidMediaId(list?.subChannelId)?.tabName
                                                          : getChannelId(list?.channelId)?.tabName;
                                                const tabName = getNameType(currTab);
                                                const tabValue = currTab;
                                                const tabValueName = tabName;
                                                const verticalValues = Object.keys(availableTabs);
                                                const verticalIndex = verticalValues?.indexOf(tabValueName);
                                                const selectedArray = availableTabs[`${tabValueName}`];
                                                const tabIndex = selectedArray?.indexOf(tabValue);
                                                dispatch(
                                                    setTabforEdit({
                                                        type: tabValueName,
                                                        currentTab: verticalIndex,
                                                    }),
                                                );
                                                dispatch(
                                                    updateTab({
                                                        field: tabValueName,
                                                        data: {
                                                            tabName: availableTabs[tabValueName][tabIndex],
                                                            currentIndex: tabIndex,
                                                        },
                                                    }),
                                                );
                                                navigate(
                                                    `/communication/create-communication?q=${encryptState}`,
                                                );
                                            }
                                        },
                                    });
                                }
                            }}
                        />
                    }
                    titleNode={
                        <>
                            <TruncateCell value={list?.campaignName} noTable />
                            {renderCommunicationListingTags({
                                tags: list?.tags,
                                campaignId: list?.campaignId,
                                campaignName: list?.campaignName,
                            })}
                        </>
                    }
                    wrapBody={false}
                    bodyContent={galleryBodyContent}
                    hideInfoTrigger={isPerSlideInfo}
                    isInfoOpen={detailedInfoON}
                    onInfoOpen={handleCardInfoOpen}
                    onInfoClose={() => detailedInfoOFF(false)}
                    info={{
                        topItems: [
                            {
                                label: DELIVERY_METHOD,
                                value:
                                    list?.deliveryMethod === 'S'
                                        ? 'Single dimension'
                                        : list?.deliveryMethod === 'M'
                                          ? 'Multi dimension'
                                          : 'Event trigger',
                            },
                            {
                                label: COMMUNICATION_TYPE,
                                value: list?.attributeName || '',
                            },
                        ],
                        metrics: [
                            {
                                label: TOTAL_AUDIENCE,
                                value: numberWithCommas(infoData?.totalaudience ?? 'NA'),
                            },
                            {
                                label: REACH,
                                value: numberWithCommas(infoData?.reachCount ?? 'NA'),
                            },
                            {
                                label: ENGAGEMENT,
                                value: numberWithCommas(infoData?.engagementCount ?? 'NA'),
                            },
                            {
                                label: CONVERSION,
                                value: numberWithCommas(infoData?.conversionCount ?? 'NA'),
                            },
                        ],
                        isLoading: infoFactLoading,
                    }}
                    infoTrigger={
                        <RSTooltip position="top" text={INFO} className="lh0">
                            <i
                                className={`${circle_info_mini} icon-xs primary-color ${list?.channelId === 1 ? 'bg-white border-r50' : ''}`}
                                id="rs_data_circle_info"
                            />
                        </RSTooltip>
                    }
                />
            </Col>
            {popupStatus.status && (
                <GallerySelectModal
                    show={popupStatus.status}
                    onHide={() => {
                        setPopupStatus((pre) => ({ ...pre, status: false }));
                    }}
                    selectedItem={popupStatus.popupValue}
                />
            )}
            <DuplicateModal
                show={duplicateModal.show}
                onHide={() => {
                    if (isDuplicating) return;
                    setDuplicateModal({ show: false, selectedCommunication: {} });
                }}
                selectedCommunication={duplicateModal.selectedCommunication}
                onDuplicate={handleDuplicate}
                isDuplicating={isDuplicating}
            />
            <RSConfirmationModal
                show={showArchiveModal}
                text={ARE_YOU_SURE_ARCHIVE}
                primaryButtonText={OK}
                handleClose={() => setShowArchiveModal(false)}
                handleConfirm={handleConfirmArchive}
                isCloseButton={false}
            />
        </>
    );
};

export default Card;
export { Card as ResTemplateCard };
