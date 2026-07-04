import { charNumatdotUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { link_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { map as _map } from 'Utils/modules/lodashReplacements';
import RSModal from 'Components/RSModal';
import AdvanceSearch from 'Components/AdvanceSearch';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { getLiveTest } from 'Reducers/communication/createCommunication/Create/request';
import { BRAND_ID } from 'Constants/GlobalConstant/Placeholders';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import { Carousel } from 'react-bootstrap';
import { locationPreview } from '../../constant';
import MessagingContext from '../../context';

const LivePreviewModal = ({
    show,
    content = '',
    audience,
    handleClose,
    sendPreview = () => { },
    type,
    previewImage,
    dataSource,
    CustomPreviewComponent = null,
    headerContent,
    carouselContent,
    currData,
    actions,
    isCarousel,
    editorText,
    header,
    footer,
    mediaType,
    ...rest
}) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const { getValues } = useFormContext();
    const context = useContext(MessagingContext);
    const name = 'clientWASenderId';
    const { isFooter, locationDetails: { locationAddress, locationName } } = rest
    const props = {
        carouselContent,
        previewImage,
        headerContent,
        editorText,
        header,
        footer,
        mediaType,
        isFooter,
        locationAddress,
        locationName
    };
    const [previewPropsData, setPreviewPropsData] = useState(props);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [passportDataconfirm, setpassportData_confirm] = useState(false);
    const [passportData, setpassportData] = useState('');
    const [passportID, setpassportID] = useState('');
    const liveSearchLoader = useApiLoader({ autoFetch: false });
    const sendToMeLoader = useApiLoader({ autoFetch: false });
    const [isSendPending, setIsSendPending] = useState(false);
    const isSubmitting = sendToMeLoader.isFetching || isSendPending;

    useEffect(() => {
        if (!show) {
            liveSearchLoader.reset();
            sendToMeLoader.reset();
            setIsSendPending(false);
        }
    }, [show]);

    const buildContent = () => {
        let obj = {
            headerContent: props?.headerContent,
            header: props?.header,
            footer: props?.footer,
            editorText: props?.editorText,
            carouselContent: props?.carouselContent?.map((item) => item.editorText)
        }
        return JSON.stringify(obj)
    }

    const applyLiveSearchResult = (res) => {
        if (res?.status) {
            const contentDetails = (() => {
                try {
                    return JSON.parse(res?.data);
                } catch {
                    return content;
                }
            })();
            const tempData = res.passportId;
            setpassportID(tempData);
            if (tempData?.length > 1) {
                setpassportData(res?.data);
                setNavigate_confirm(true);
                setpassportData_confirm(false);
                setPreviewPropsData((pre) => ({
                    ...pre,
                    editorText: contentDetails?.editorText,
                    header: contentDetails?.header,
                    footer: contentDetails?.footer,
                    headerContent: contentDetails?.headerContent,
                    carouselContent: previewPropsData?.carouselContent?.map((item, ind) => ({
                        ...item,
                        editorText: contentDetails?.carouselContent[ind],
                    })),
                }));
            } else {
                setpassportData('');
                setNavigate_confirm(false);
                setpassportData_confirm(true);
                setPreviewPropsData(props);
            }
        } else {
            setpassportData('');
            setNavigate_confirm(false);
            setpassportData_confirm(true);
            setPreviewPropsData(props);
        }
        setTimeout(() => { setpassportData_confirm(false); }, 3000);
    };

    const handleSearch = async ({ type, text }) => {
        const payload = {
            content: buildContent(),
            recipientType: type.charAt(0),
            recipientTo: text,
            campaignId: location?.campaignId,
            splittype: '',
            recipientsList:
                dataSource === 'DL' && location?.campaignType === 'M'
                    ? [location?.mdcContentSetupDetails?.dynamiclistId]
                    : location?.campaignType === 'T'
                        ? [location?.dynamicListId]
                        : _map(audience, 'segmentationListId'),
            listType: _map(audience, 'listType'),
            campaignChannelId: 2,
            campaigntype: location?.campaignType,
            isFlashSmsEnabled: false,
            dataSource: '',
            clientId,
            userId,
            departmentId,
            dynamicListId:
                location?.campaignType === 'T'
                    ? location?.dynamicListId
                    : location?.campaignType === 'M'
                        ? location?.mdcContentSetupDetails?.dynamiclistId
                        : '',
            subsegmentGroupingEnabled: location?.mdcContentSetupDetails?.isGroupCommunication ?? false,
            isSubsegmentEnabled: location?.mdcContentSetupDetails?.isSubsegmentJoureny ?? false,
            subsegmentId: location?.mdcContentSetupDetails?.subSegmentId || 0,
            subsegmentLevel: location?.mdcContentSetupDetails?.subSegmentLevel || 0,
            priority: location?.mdcContentSetupDetails?.priority || 0,
        };
        const res = await liveSearchLoader.refetch({
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            fetcher: () => dispatch(getLiveTest(payload, { loading: false })),
        });
        if (res !== undefined) {
            applyLiveSearchResult(res);
        }
    };
    const advanceSearchOptionss = ['By mobile no', 'By Brand ID'];

    const handleSendToMe = () => {
        if (!navigate_confirm || isSubmitting) return;
        setIsSendPending(true);
        sendToMeLoader.refetch({
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            fetcher: async () => sendPreview(passportID),
            onSettled: () => setIsSendPending(false),
        });
    };

    const getActionBtnContent = (isCarousel, carouselActions) => {
        let action = isCarousel ? carouselActions : actions
        if (!action?.length) return null;

        return (
            <div className="d-flex flex-column text-center">
                {action?.map((item, index) => {
                    return (
                        <div className="whatsapp-cta align-items-center d-flex justify-content-center">
                            {<i
                                className={`${link_mini} icon-xs`}
                            />} {item?.actionName}
                        </div>
                    );
                })}
            </div>

        );
    };
    const getCarouselRenderContent = () => {
        if (!previewPropsData?.carouselContent?.length) return null;

        return (
            <Carousel
                interval={null}
                controls={true}
                indicators={false}
                className="carousel-simple"
                wrap={true}
            >
                {previewPropsData?.carouselContent.map((item, index) => {
                    const isImage = currData?.mediaType === 'image';

                    return (
                        <Carousel.Item key={index} className="wbrw-content">
                            {isImage ? (
                                <img
                                    className="d-block"
                                    src={item?.previewImage}
                                    alt={`carousel-img-${index}`}
                                />
                            ) : (
                                <video
                                    className="d-block"
                                    style={{
                                        width: '200px',
                                        height: 'auto',
                                        margin: '0 auto',
                                    }}
                                    src={item?.previewImage}
                                    controls
                                    alt={`carousel-video-${index}`}
                                />
                            )}

                            {(item?.header || item?.editorText) && (
                                <div
                                    className="carousel-text"
                                    dangerouslySetInnerHTML={{
                                        __html: `${item?.header ? `<b>${item.header}</b><br/><br/>` : ''}<p>${item?.editorText || ''
                                            }</p>`,
                                    }}
                                />
                            )}

                            {getActionBtnContent?.(true, item?.actions)}
                        </Carousel.Item>
                    );
                })}
            </Carousel>
        );
    };

    return (
        <RSModal
            size={'lg'}
            className="rs-modal-preview-mobile"
            show={show}
            isCloseDisabled={isSubmitting}
            handleClose={() => {
                if (isSubmitting) return;
                setpassportData('');
                setpassportData_confirm(false);
                setNavigate_confirm(false);
                handleClose();
            }}
            headerRightContent={
                <div className="advanceSearchContainer">
                    <div className="advanceSearchBlock">
                        {liveSearchLoader.isFetching ? (
                            <div className="segment_loader" />
                        ) : (
                            <AdvanceSearch
                                advanceSearchOptions={['Mobile no', BRAND_ID]}
                                tooltipOverlayClassZindex={true}
                                searchText={handleSearch}
                                onKeydown={(e) => {
                                    const currentOption = advanceSearchOptionss.find(
                                        (option) => option === e.target.placeholder,
                                    );
                                    if (currentOption === 'By mobile no') {
                                        onlyNumbers(e);
                                    } else {
                                        charNumatdotUnderScore(e);
                                    }
                                }}
                                advSearchSmall
                                hideDropdown={true}
                            />
                        )}
                    </div>
                </div>
            }
            header={'Live preview'}
            body={
                <Fragment>
                    {passportDataconfirm && <p className="color-primary-red">Invalid audience</p>}

                    <div
                        className={`${!editorText?.length ? 'rs-mobile-preview-disable' : 'rs-mobile-preview-enable'
                            } modalWACarouselPreview`}
                    >
                        <RSMobilePreview
                            previewSource={PREVIEW_SOURCE.LIVE_PREVIEW}
                            mobileType="ios"
                            bubbleType={context}
                            barHeight={'medium'}
                             className="mx-auto float-none"
                            bubbleContent={
                                !isCarousel &&
                                previewPropsData?.editorText?.length ?
                                `<p>${previewPropsData.header && (!mediaType || mediaType === 'text') ? `<strong>${previewPropsData.header}</strong>` : ''}</p>${previewPropsData.header && (!mediaType || mediaType === 'text') ? '<br/>' : ''
                                }<p>${mediaType === 'location' ? '' : previewPropsData.editorText}</p><p><small>${previewPropsData.footer && mediaType !== 'location' ? previewPropsData.footer : ''}</small></p>` : ''
                            }
                            searchIcon
                            // schedule={context?.levelNumber < 2 ? schedule : ''}
                            previewImage={mediaType !== 'text' && previewPropsData?.header ? previewPropsData.header : previewImage}
                            customRenderContent={!isCarousel && mediaType === 'location' ? locationPreview({
                                locationName: previewPropsData?.locationName,
                                locationAddress: previewPropsData?.locationAddress,
                                editorText: previewPropsData?.editorText,
                                footer: previewPropsData?.footer,
                                isFooter: previewPropsData?.isFooter,
                                actionList: getActionBtnContent()
                            }) : getActionBtnContent()}
                            caruoselContent={getCarouselRenderContent()}
                            headerContent={isCarousel ? previewPropsData?.headerContent : ''}
                            // senderName={senderName?.senderName}
                            customRenderClassName={mediaType === 'location' ? '' : 'mb5'}
                            mediaType={mediaType}
                            schedule={getValues('schedule')}
                        />
                    </div>
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton
                        blockInteraction={isSubmitting}
                        onClick={() => {
                            if (isSubmitting) return;
                            setpassportData('');
                            setpassportData_confirm(false);
                            setNavigate_confirm(false);
                            handleClose();
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={handleSendToMe}
                        disabledClass={navigate_confirm && !isSubmitting ? '' : 'pe-none click-off'}
                        isLoading={sendToMeLoader.isFetching}
                        blockBodyPointerEvents
                    >
                        Send to me
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default LivePreviewModal;
