import { deCodeId, encodeUrl } from 'Utils/modules/crypto';
import { GetpopoverContentPlanner, PREVIEW_SOURCE, hasListingPreviewApiContent, ListingPreviewNoDataPanel } from 'Utils/modules/preview';
import { arrow_right_mini, list_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Icon from 'Components/Icon/Icon';
import { tableComponent } from '../Constants';
import RSModal from 'Components/RSModal';

import Preview from './Preview';
import { getSummaryList } from 'Reducers/analyticsSSR/analyticsSummary/selector';
import { useDispatch, useSelector } from 'react-redux';
// import { getGalleryDetails } from 'Reducers/analyticsSSR/communicationAnalytics/request';
import { updateAnalyticsDetail } from 'Reducers/analyticsSSR/communicationAnalytics/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { Get_Preview_By_Channel } from 'Reducers/communication/listing/request';
import EmailListPreview from 'Pages/AuthenticationModule/Communication/Component/EmailListPreview/EmailListPreview';
import RSWebPreview from 'Pages/AuthenticationModule/Communication/Component/RSWebPreview';
import RSMobileListPreview from 'Pages/AuthenticationModule/Communication/Component/RSMobileListPreview';
import { buildAnalyticsReportReturnPath } from 'Pages/AuthenticationModule/Analytics/Pages/communicationAnalytics/DetailedAnalytics/constants';
import { ChannelPreviewSkeleton } from 'Components/Skeleton/Skeleton';
import KendoGrid from 'Components/RSKendoGrid';

const CommunicationAnalysisTable = ({ list, stateVal, retarget, index }) => {
    const dispatch = useDispatch();

    const splitScheduleColumns = useMemo(() => {
        const baseColumns = [
            { field: 'S_No', title: 'S.No', width: 80 },
            { field: 'Days', title: 'Days', width: 140 }
        ];

        let specificColumns = [];
        const channelId = Number(list?.channelId);

        if (channelId === 1) { // Email
            specificColumns = [
                { field: 'noOfAudienceCount', title: 'Total Audience', width: 160, className: 'text-right', headerClassName: 'text-right' },
                { field: 'sentCount', title: 'Sent count', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'deliveredCount', title: 'Delivered count', width: 160, className: 'text-right', headerClassName: 'text-right' },
                { field: 'hardBouncedCount', title: 'Hard bounce', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'softBouncedCount', title: 'Soft bounce', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'quarantinedCount', title: 'Quarantined', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'uniqueOpens', title: 'Unique open', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'uniqueClicks', title: 'Unique clicks', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'noOfForwadsCount', title: 'Forwards', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'unscrible', title: 'Unsubscribed', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'spam', title: 'Marked as spam', width: 160, className: 'text-right', headerClassName: 'text-right' },
                { field: 'unattended', title: 'Unattended', width: 140, className: 'text-right', headerClassName: 'text-right' }
            ];
        } else if (channelId === 2) { // SMS
            specificColumns = [
                { field: 'noOfAudienceCount', title: 'Total Audience', width: 160, className: 'text-right', headerClassName: 'text-right' },
                { field: 'deliveredCount', title: 'Delivered', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'expiredCount', title: 'Expired', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'rejectedCount', title: 'Rejected', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'dndCount', title: 'DND', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'repliedCount', title: 'Replied', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'unDeliveredCount', title: 'Undelivered', width: 150, className: 'text-right', headerClassName: 'text-right' }
            ];
        } else if (channelId === 3 || channelId === 21) { // WhatsApp
            specificColumns = [
                { field: 'totalNoOfRecipientsCount', title: 'Audience', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'totalDeliveredCount', title: 'Delivered', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'totalSeenCount', title: 'Seen', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'totalRespondedCount', title: 'Responded', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'totalNotReadCount', title: 'Not Read', width: 140, className: 'text-right', headerClassName: 'text-right' },
                { field: 'totalUndeliveredCount', title: 'Undelivered', width: 150, className: 'text-right', headerClassName: 'text-right' },
                { field: 'totalRejectedCount', title: 'Rejected', width: 140, className: 'text-right', headerClassName: 'text-right' }
            ];
        } else { // Fallback to a default view
            specificColumns = [
                { field: 'deliveredCount', title: 'Delivered count' }
            ];
        }

        return [...baseColumns, ...specificColumns];
    }, [list?.channelId]);
    const navigate = useNavigate();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const locationState = useQueryParams('/AnalyticsSSE/analytics-report');

    const [showModal, setShowModal] = useState({
        modalStatus: false,
        modalInfo: '',
        profileData: '',
    });

    const [isTableView, setIsTableView] = useState(false);



    const [isPreviewLoading, setIsPreviewLoading] = useState(true);
    const [hasPreviewData, setHasPreviewData] = useState(false);

    const [previewData, setPreviewData] = useState({
        channelImage: list?.galleryImageThump,
        previewImage: list?.galleryImagePath,
        senderName: list?.senderName || '',
        scheduleDateTime: list?.scheduleDateTime,
        isCarousel: false,
        carouselJSON: undefined,
        header: undefined,
        footer: undefined,
        content: '',
        footerContent: '',
        notifications: undefined,
        notification: undefined,
        slides: undefined,
        contentJson: ''
    });

    const summary = useSelector((state) => getSummaryList(state));
    const { summarySubSegmentDetail, listingPreviewImage } = useSelector(
        ({ analyticsReportSSRReducer }) => analyticsReportSSRReducer,
    );

    const splitScheduleData = useMemo(() => {
        let rawData = list?.channelDetailid;
        const channelId = Number(list?.channelId);

        if (summary && summary.factModelDayWise) {
            const channelName = channelId === 1 ? 'email' : channelId === 2 ? 'sms' : (channelId === 3 || channelId === 21) ? 'whatsapp' : '';
            if (channelName && summary.factModelDayWise[channelName]) {
                const daywiseArray = summary.factModelDayWise[channelName] || [];
                const blastDaywiseData = daywiseArray.filter(item => item.blastId === list?.blastId);
                if (blastDaywiseData.length > 0) {
                    rawData = blastDaywiseData;
                }
            }
        }

        if (!Array.isArray(rawData)) return [];
        return rawData.map((item, i) => {
            let processedItem = { ...item };
            const isEmail = channelId === 1;
            const isSMS = channelId === 2;
            const isWhatsApp = channelId === 3 || channelId === 21;
            
            const audienceCount = isWhatsApp ? Number(item.totalNoOfRecipientsCount || 0) : Number(item.noOfAudienceCount || 0);

            if (audienceCount === 0) {
                if (isEmail) {
                    ['noOfAudienceCount', 'sentCount', 'deliveredCount', 'hardBouncedCount', 'softBouncedCount', 'quarantinedCount', 'uniqueOpens'].forEach(key => {
                        processedItem[key] = 'NA';
                    });
                } else if (isSMS) {
                    ['noOfAudienceCount', 'deliveredCount', 'expiredCount', 'rejectedCount', 'dndCount', 'repliedCount', 'unDeliveredCount'].forEach(key => {
                        processedItem[key] = 'NA';
                    });
                } else if (isWhatsApp) {
                    ['totalNoOfRecipientsCount', 'totalDeliveredCount', 'totalSeenCount', 'totalRespondedCount', 'totalNotReadCount', 'totalUndeliveredCount', 'totalRejectedCount'].forEach(key => {
                        processedItem[key] = 'NA';
                    });
                }
            }

            return {
                ...processedItem,
                S_No: i + 1,
                Days: processedItem.Days || `Day ${String(i + 1).padStart(2, '0')}`
            };
        });
    }, [list?.channelDetailid, list?.channelId, list?.blastId, list?.scheduleDateTime, summary]);
    const campaignId = deCodeId(summary?.encodeCampaignID);
    const { blastId, blastName } = list;
    const channelId = Number(list?.channelId);

    const buildNavigationState = () => {
        const isWinnerSplit = summary?.iswinnerSplit;
        const channel = stateVal.channelId === 10 ? stateVal.channelId : channelId;

        return {
            channelName: blastName,
            campaignId: +campaignId,
            channelId: channel,
            subChannelId: list?.subChannelId ?? 0,
            campaignTypeValue: stateVal?.campaignTypeValue,
            blastId,
            startDate: summary?.startDate,
            endDate: summary?.endDate,
            campaignName: summary?.campaignName,
            iswinnerSplit: isWinnerSplit,
            iswinnerSplitType: summary?.iswinnerSplitType,
            isSplitAB: list?.isSplitAB,
            isSplitABScheduler: isWinnerSplit ? false : list?.isSplitAB,
            splitName: isWinnerSplit
                ? 'Actual communication'
                : list?.splitType
                  ? `Split ${list.splitType}`
                  : '',
            subSegmentLevel:
                summarySubSegmentDetail?.subSegmentLevel ?? locationState?.subSegmentLevel,
            subSegmentFriendlyName:
                summarySubSegmentDetail?.subSegmentFriendlyName ??
                locationState?.subSegmentFriendlyName,
            iswinnerBlastId: isWinnerSplit && summary?.iswinnerB2 ? summary?.iswinnerB2 : '',
            fromPath: buildAnalyticsReportReturnPath({
                from: locationState?.from ?? +campaignId,
                campaignName: locationState?.campaignName ?? summary?.campaignName,
                isGolden: locationState?.isGolden ?? summary?.isGoldenCampaign,
                startDate: locationState?.startDate ?? summary?.startDate,
                endDate: locationState?.endDate ?? summary?.endDate,
                campaignTypeValue: locationState?.campaignTypeValue ?? stateVal?.campaignTypeValue,
                channelId: locationState?.channelId ?? summary?.channelList,
                subSegmentFriendlyName:
                    summarySubSegmentDetail?.subSegmentFriendlyName ?? locationState?.subSegmentFriendlyName,
                subSegmentLevel:
                    summarySubSegmentDetail?.subSegmentLevel ?? locationState?.subSegmentLevel,
                fromPath: locationState?.fromPath,
                basePath: '/AnalyticsSSE/analytics-report',
            }),
        };
    };

    const getDetailsUrl = () => {
        const encryptState = encodeUrl(buildNavigationState());
        return `/AnalyticsSSE/detail-analytics?q=${encryptState}`;
    };

    const handleDetailsClick = (e) => {
        e.preventDefault();
        const state = buildNavigationState();
        dispatch(
            updateAnalyticsDetail({
                blastId,
                campaignId: +campaignId,
                campaignName: summary?.campaignName,
                channelName: blastName,
                channelId,
                currIndex: index,
                from: 'analytics/analytics-report',
                departmentId,
                clientId,
                userId,
                subSegmentLevel: state.subSegmentLevel,
                subSegmentFriendlyName: state.subSegmentFriendlyName,
                iswinnerBlastId: state.iswinnerBlastId,
                iswinnerSplit: state.iswinnerSplit,
                iswinnerSplitType: state.iswinnerSplitType,
                isSplitABScheduler: state.isSplitABScheduler,
                splitName: state.splitName,
            }),
        );
        const encryptState = encodeUrl(state);
        navigate(`/AnalyticsSSE/detail-analytics?q=${encryptState}`, {
            state,
        });
        // navigate(`/AnalyticsSSE/detail-analytics`, {
        //     state: {
        //         channelName: blastName,
        //         campaignId: campaignId,
        //     },
        // });
        setTimeout(() => {
            window.scroll(0, 0);
        }, 2000);
    };
    // const dateField = `${getUserDateTimeFormat(summary?.startDate, 'formatDate')} - ${getUserDateTimeFormat(
    //     summary?.endDate,
    //     'formatDate',
    // )}`;
    useEffect(() => {
        handleFetchPreview();
    }, [list?.blastId]);

    const handleFetchPreview = async () => {
        setIsPreviewLoading(true);
        const payload = {
            userId,
            departmentId,
            clientId,
            campaignId: Number(campaignId),
            channelId: channelId || 0,
            levelNumber: list?.levelNumber || 1,
            ChannelDetailID: list?.channelDetailid || 0,
        };

        try {
            const previewResponse = await dispatch(Get_Preview_By_Channel(payload, false));
            if (hasListingPreviewApiContent(channelId, previewResponse, list)) {
                const previewDataFromApi = previewResponse?.data?.[0] || {};
                setPreviewData({
                    channelImage: previewDataFromApi?.content || list?.galleryImageThump,
                    previewImage: previewDataFromApi?.imagePath || list?.galleryImagePath || previewDataFromApi?.mediaurl,
                    senderName: list?.senderName || '',
                    scheduleDateTime: list?.scheduleDateTime,
                    isCarousel: previewDataFromApi?.isCarousel || false,
                    carouselJSON: previewDataFromApi?.carouselJSON || undefined,
                    header: list?.header || undefined,
                    footer: list?.footer || previewDataFromApi?.footer || undefined,
                    content: previewDataFromApi?.content || '',
                    footerContent: previewDataFromApi?.footerContent || '',
                    notifications: previewResponse?.data || undefined,
                    notification: previewDataFromApi || undefined,
                    slides: previewResponse?.data || undefined,
                    contentJson: previewDataFromApi?.contentjson || ''
                });
                setHasPreviewData(true);
            } else {
                setHasPreviewData(false);
            }
        } catch (error) {
            setHasPreviewData(false);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    // const handleSelectedDetails = async () => {
    //     let payload = {
    //         departmentId,
    //         clientId,
    //         userId,
    //         campaignId: campaignId,
    //         blastguid: list.blastScheduleId,
    //         // departmentId: 1,
    //         // clientId: 654,
    //         // userId: 589,
    //         // campaignId: 965,
    //         // blastguid: 'cc9c46c1-39e2-4a66-a238-f85fdeac10cc',
    //     };
    //     const response = await dispatch(getGalleryDetails(payload));
    //     if (response?.status) {
    //         setShowModal((pre) => ({ ...pre, profileData: response.data }));
    //     } else {
    //         console.log(response.error);
    //     }
    // };

    const showSplitSchedule = [1, 2, 3].includes(Number(list?.channelId)) && summary?.isLimitList;

    return (
        <div className="theme-radius-bottom">
            {isTableView ? (
                <div className="w-100 p-3 pt-0">
                    <div className="d-flex align-items-center justify-content-between mb15">
                        <h4 className="m-0 font-weight-bold">Split schedule</h4>
                        <span onClick={() => setIsTableView(false)} className="cp" style={{ cursor: 'pointer' }}>
                            <Icon icon={list_mini} size="md" color="color-primary-blue cp" />
                        </span>
                    </div>
                    <div className="analysis-table-wrapper">
                        <KendoGrid
                            data={splitScheduleData}
                            column={splitScheduleColumns}
                            pageable={true}
                            config={{ skip: 0, take: 5, pageSize: 5 }}
                            isCustomPagination={false}
                            scrollable
                            isScrollTop={false}
                        />
                    </div>
                </div>
            ) : (
                <Row>
                    <Col md={8} className='fact-data'>
                    {showSplitSchedule && (
                        <div className="d-flex align-items-center mb15">
                            <h4 className="m-0 font-weight-bold">Split schedule</h4>
                        </div>
                    )}
                    {tableComponent({ ...list, retargetenabled: retarget })}
                    {!summary?.isFromSnapshot && (
                        <div className="d-flex align-items-center justify-content-end">
                            <a
                                href={getDetailsUrl()}
                                className="color-primary-blue cp"
                                onClick={handleDetailsClick}
                                style={{ textDecoration: 'none' }}
                            >
                                Details
                            </a>
                            <Icon icon={arrow_right_mini} size="xs" color="color-primary-blue" />
                        </div>
                    )}
                </Col>
                <Col md={4} className={stateVal?.channelId === 10 ? 'd-none' : ''}>
                    {showSplitSchedule && (
                        <div className="d-flex justify-content-end mb15">
                            <span onClick={() => setIsTableView(true)} className="cp" style={{ cursor: 'pointer' }}>
                                <Icon icon={list_mini} size="md" color="color-primary-blue cp" />
                            </span>
                        </div>
                    )}
                    {isPreviewLoading ? (
                        <ChannelPreviewSkeleton />
                    ) : !hasPreviewData ? (
                        <div className="analysis-preview-wrapper analysis-preview-ThumbWrapper box-design no-box-shadow">
                            <ListingPreviewNoDataPanel />
                        </div>
                    ) : (
                        <div
                            className={
                                [1, 3, 4, 5, 6, 8, 9, 13, 15, 26]?.includes(channelId)
                                    ? 'analysis-preview-wrapper analysis-preview-ThumbWrapper box-design no-box-shadow'
                                    : 'analysis-preview-wrapper'
                            }
                        >
                            <div
                                className="preview-view"
                                onClick={() => {
                                    // handleSelectedDetails()
                                }}
                            >
                                <Preview
                                    setShowModal={setShowModal}
                                    blastName={blastName}
                                    channelId={channelId}
                                    channelImage={previewData.channelImage}
                                    previewImage={previewData.previewImage}
                                    scheduleDateTime={previewData.scheduleDateTime}
                                    senderName={previewData.senderName}
                                    isCarousel={previewData.isCarousel}
                                    carouselJSON={previewData.carouselJSON}
                                    header={previewData.header}
                                    footer={previewData.footer}
                                    content={previewData.content}
                                    footerContent={previewData.footerContent}
                                    notifications={previewData.notifications}
                                    notification={previewData.notification}
                                    slides={previewData.slides}
                                    contentJson={previewData?.contentJson}
                                />
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
            )}

            {/* <small className="portlet-info-text com-ana-small">(As on: {getCreatedDate(summary?.jobDateTime)})</small> */}
            <RSModal
                show={showModal.modalStatus}
                handleClose={() => setShowModal((pre) => ({ ...pre, modalStatus: false }))}
                isBorder
                size={'lg'}
                header={blastName}
                bodyClassName={'pt30'}
                body={
                    <Fragment>
                        <div className={` ${[8,14]?.includes(channelId) ? '' : 'modal-img-box'}  ${[2, 21, 41]?.includes(channelId) ? '' : 'css-scrollbar'} analytics-modal-preview`}>
                            {channelId === 1 ? (
                                <EmailListPreview
                                    data={{
                                        content: previewData.content,
                                        footerContent: previewData.footerContent,
                                        previewImage: previewData.previewImage,
                                        showAsHtml: true,
                                        isModalPreview: true,
                                        isAnalytics: true,
                                    }}
                                />
                            ) : channelId === 8 ? (
                                Array.isArray(previewData.notifications) && previewData.notifications.length ? (
                                   
                                        <RSWebPreview
                                            notifications={previewData.notifications}
                                            previewImage={previewData.previewImage}
                                            isAnalytics
                                            previewSource={PREVIEW_SOURCE.CSR}
                                        />
                                   
                                ) : previewData.notification ? (
                                    
                                        <RSWebPreview
                                            notification={previewData.notification}
                                            previewImage={previewData.previewImage}
                                            isAnalytics
                                            previewSource={PREVIEW_SOURCE.CSR}
                                        />
                                   
                                ) : (
                                    GetpopoverContentPlanner({ channelId, content: showModal.modalInfo, senderName: previewData.senderName, previewImage: previewData.previewImage, scheduleDate: previewData.scheduleDateTime, carouselJSON: previewData.carouselJSON, isCarousel: previewData.isCarousel, header: previewData.header, footer: previewData.footer, imagePath: previewData.previewImage, className: 'rs-listing-messaging-preview', previewSource: PREVIEW_SOURCE.CSR })
                                )
                            ) : channelId === 14 ? (
                                Array.isArray(previewData.slides) && previewData.slides.length ? (
                                    <div className='mobile tabs-content mx-auto position-relative'>
                                        <RSMobileListPreview slides={previewData.slides} previewSource={PREVIEW_SOURCE.CSR} />
                                    </div>
                                ) : (
                                    GetpopoverContentPlanner({ channelId, content: showModal.modalInfo, senderName: previewData.senderName, previewImage: previewData.previewImage, scheduleDate: previewData.scheduleDateTime, carouselJSON: previewData.carouselJSON, isCarousel: previewData.isCarousel, header: previewData.header, footer: previewData.footer, imagePath: previewData.previewImage, className: 'rs-listing-messaging-preview', previewSource: PREVIEW_SOURCE.CSR })
                                )
                            ) : (
                                GetpopoverContentPlanner({ channelId, content: showModal.modalInfo, senderName: previewData.senderName, previewImage: previewData.previewImage, scheduleDate: previewData.scheduleDateTime, carouselJSON: previewData.carouselJSON, isCarousel: previewData.isCarousel, header: previewData.header, footer: previewData.footer, imagePath: previewData.previewImage, contentJson: previewData?.contentJson, className: 'rs-listing-messaging-preview', previewSource: PREVIEW_SOURCE.CSR })
                            )}

                            {/* {['SMS', 'Two-Way SMS', 'WhatsApp', 'Line', 'VMS'].includes(blastName) ? (
                                <div className="rs-mobile-preview-box">
                                    <SmsPreview content={showModal.modalInfo} />
                                </div>
                            ) : (
                                <img alt={''} src={`data:image/jpeg;base64,${showModal.modalInfo}`} />
                                // <img className="" src={showModal.modalInfo} />
                            )} */}
                        </div>
                    </Fragment>
                }
            />
        </div>
    );
};
export default memo(CommunicationAnalysisTable);
