import { charNumatdotUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { Fragment, useEffect, useState } from 'react';
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
import { Carousel } from 'react-bootstrap';
import RSMobilePreview from 'Components/Previews/RSMobilePreview';
import { PREVIEW_SOURCE } from 'Components/Previews/RSMobilePreview/utils';
const LivePreview = ({
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
    titleText,
}) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const { getValues } = useFormContext();
    const name = type === 'rcs' ? 'clientRCSSenderId' : 'clientSmsSettingId';
    const props = {
        carouselContent,
        previewImage,
        headerContent,
        editorText,
        titleText,
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
            titleText: props?.titleText,
            editorText: props?.editorText,
            carouselContent: props?.carouselContent,
        };
        return JSON.stringify(obj);
    };

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
                    titleText: contentDetails?.titleText,
                    headerContent: contentDetails?.headerContent,
                    carouselContent: previewPropsData?.carouselContent?.map((item, ind) => ({
                        ...item,
                        titleText: contentDetails?.carouselContent[ind]?.titleText,
                        editorText: contentDetails?.carouselContent[ind]?.editorText,
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
            campaignChannelId: 3, // RCS channel ID
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
        let action = isCarousel ? carouselActions : actions;
        if (!action?.length) return null;

        return (
            <div className="d-flex justify-content-center flex-column mt10">
                {action?.map((item, index) => (
                    <div key={index} className='RCS-cta'>
                        <button className='bg-tertiary-grey p8 w-100 border-r10'>
                            {item?.actionName}
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const getCarouselRenderContent = () => {
        if (!previewPropsData?.carouselContent?.length) return null;

        return (
            <Carousel interval={null} controls={true}>
                {previewPropsData?.carouselContent.map((item, index) => {
                    return (
                        <Carousel.Item key={index} className="css-scrollbar">
                            {!!item?.previewImage && (
                                <>
                                    {item?.bannerType === 'Video' ? (
                                        <video className="d-block w-100" controls>
                                            <source src={item?.previewImage} />
                                        </video>
                                    ) : (
                                        <img
                                            className="d-block w-100"
                                            src={item?.previewImage}
                                            alt={`carousel-img-${index}`}
                                        />
                                    )}
                                </>
                            )}
                            <Carousel.Caption className='p12'>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: `<b><p class="mt5 mb2">${item?.titleText || ''}</p></b><p>${item?.editorText || ''
                                            }</p>`,
                                    }}
                                />
                                {getActionBtnContent(true, item?.actions)}
                            </Carousel.Caption>
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
                                    if (e.ctrlKey || e.metaKey || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Backspace' || e.key === 'Delete') {
                                        return;
                                    }
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
                        className={`${!previewPropsData.editorText?.length ? 'rs-mobile-preview-disable' : 'rs-mobile-preview-enable'
                            }  RCS-preview `}
                    >
                        <RSMobilePreview
                            previewSource={PREVIEW_SOURCE.LIVE_PREVIEW}
                            mobileType="ios"
                            bubbleType={{
                                type: 'rcs',
                            }}
                            barHeight={'medium'}
                            className="mx-auto float-none"
                            bubbleContent={
                                previewPropsData?.editorText?.length &&
                                !isCarousel &&
                                `<b>${previewPropsData?.titleText}</b><p>${previewPropsData?.editorText}</p>`
                            }
                            // bubbleContent={
                            //     !isCarousel &&
                            //     previewPropsData?.editorText?.length &&
                            //     `<b>${previewPropsData.titleText ? previewPropsData.titleText : ''}</b>${
                            //         previewPropsData.titleText ? '<br/>' : ''
                            //     }<p>${previewPropsData.editorText}</p>`
                            // }
                            searchIcon
                            previewImage={previewPropsData?.previewImage}
                            customRenderContent={!isCarousel && getActionBtnContent()}
                            caruoselContent={getCarouselRenderContent()}
                            //headerContent={isCarousel ? previewPropsData?.headerContent : ''}
                            senderName={getValues('senderName')?.senderName}
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

export default LivePreview;

