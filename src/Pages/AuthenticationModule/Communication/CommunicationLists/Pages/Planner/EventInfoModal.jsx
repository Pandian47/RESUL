import { buildPlannerCarouselSlides, GetpopoverContentPlanner, hasPlannerItemPreviewContent, ListingPreviewNoDataPanel, PREVIEW_SOURCE } from 'Utils/modules/preview';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import RSModal from 'Components/RSModal';
import { Card, Col, Row } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import { uniq as _uniq ,flatten as _flatten } from 'Utils/modules/lodashReplacements';


import RSTooltip from 'Components/RSTooltip';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import PlannerEventInfoSkeleton from 'Components/Skeleton/Components/PlannerEventInfoSkeleton';

const EventInfoModal = ({
    show,
    selectedEvent,
    handleModalClose,
    isLoading = false,
    isFailure = false,
}) => {
    const channelId = _uniq(_flatten(selectedEvent?.map((res) => res.channelId)));

    // const scrollList = handleMap(selectedEvent)?.reduce((res, el, i) => {
    //     if (i % 1 === 0) {
    //         res[res?.length] = el;
    //     } else {
    //         res[res?.length - 1] = [...res[res?.length - 1], el];
    //     }
    //     return res;
    // }, []);

    const scrollList = buildPlannerCarouselSlides(selectedEvent);
    const hasCampaigns = scrollList?.length > 0;
    const hasMultipleSlides = scrollList?.length > 1;

    const renderPlannerPreview = (selecteditems) => {
        if (!hasPlannerItemPreviewContent(selecteditems)) {
            return <ListingPreviewNoDataPanel />;
        }

        return GetpopoverContentPlanner({
            channelId: selecteditems?.channelId,
            content: selecteditems?.content,
            smssenderName: selecteditems?.smssenderName,
            attachment: selecteditems?.attachment,
            imagePath: selecteditems?.imagePath,
            scheduleDate: selecteditems?.scheduleDate,
            carouselJSON: selecteditems?.carouselJSON,
            isCarousel: selecteditems?.isCarousel,
            header: selecteditems?.header,
            footer: selecteditems?.footer,
            socialPostChannelId:
                selecteditems?.socialmediaChannelId ??
                selecteditems?.socialmediachannelid ??
                selecteditems?.socialPostChannelId,
            campaigncontent: selecteditems?.campaigncontent,
            contentJson: selecteditems?.contentJSON,
            className: 'rs-listing-messaging-preview float-none mx-auto',
            previewSource: PREVIEW_SOURCE.PLANNER,
        });
    };
    return (
        <RSModal
            show={show}
            size="lg"
            isCloseButton={true}
            // isBorder={false}
            headerRightContent={false}
            handleClose={handleModalClose}
            headerTitleClass="p0"
            header={'Communication info'}
            className="p0 GalleryModal"
            // headerTitleTooltip={true}
            bodyClassName=""
            body={
                <div className="rs-planner-events-wrapper ">
                    {isLoading ? (
                        <PlannerEventInfoSkeleton />
                    ) : isFailure || !hasCampaigns ? (
                         <PlannerEventInfoSkeleton isError = {true}/>
                    ) : (
                        <Carousel
                            // variant="dark"
                            className="gaugeslider-wrapper calendar-wrapper"
                            indicators={hasMultipleSlides}
                            indicatorLabels={hasMultipleSlides}
                            interval={null}
                            controls={hasMultipleSlides}
                        >
                            {scrollList?.map((selecteditems) => {
                                // console.log('selecteditems: ', selecteditems);
                                if (selecteditems?.attributeName)
                                    return (
                                        <Carousel.Item key={selecteditems?.campaignId} className="border p5 border-r10">
                                            {/* <h6 className="crsl-top-section">
                                                <small className="d-inline-block">Created on:</small>{' '}
                                                {getDateWithDay(selecteditems.createdDate)}
                                            </h6> */}
                                            <div className="border-bottom  mb10 pb10 px5">
                                                {/* <small>Created on: {getDateWithDay(selecteditems.createdDate)}</small> */}
                                                <small className=''>Created on: {getUserCurrentFormat(selecteditems.createdDate)?.dateFormat}</small>
                                                <h3 className="d-flex color-primary-blue">
                                                    {selectedEvent[0]?.campaignName}
                                                </h3>
                                            </div>
                                            {/* <div className="rsc-duration-block">
                                                <div className="rscdb-left">
                                                    <small>Start date</small>
                                                    <h5>{getDateWithDay(selecteditems.startDate)}</h5>
                                                </div>
                                                <div className="rscdb-right">
                                                    <small>End date</small>
                                                    <h5>{getDateWithDay(selecteditems.endDate)}</h5>
                                                </div>
                                            </div>
                                            <div className="rsc-content-block">
                                                <div className="content-row">
                                                    <Row>
                                                        <Col className="col-lg-6">Communication type</Col>
                                                        <Col className="col-lg-6">
                                                            {communicationName(selecteditems.campaignType)}
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="content-row">
                                                    <Row>
                                                        <Col className="col-lg-6">Total audience</Col>
                                                        <Col className="col-lg-6">
                                                            {selecteditems.totalRecipientsCount}
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="content-row">
                                                    <Row>
                                                        <Col className="col-lg-6">Channels</Col>
                                                        <Col className="col-lg-6">
                                                            <ul className="rs-list-inline rli-space-5">
                                                                {channelId?.map((item, indexs) => {
                                                                    const channel = getChannelId(item);
                                                                    return (
                                                                        <li>
                                                                            <RSTooltip
                                                                                position="top"
                                                                                text={channel?.label}
                                                                            >
                                                                                <i
                                                                                    key={indexs}
                                                                                    className={`${channel?.icon} icon-md color-primary-blue mt2`}
                                                                                ></i>
                                                                            </RSTooltip>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </div> */}
                                            <div className="border-bottom pb10">
                                                <Row className="px5">
                                                    <Col sm={6}>
                                                        <small>Start date</small>

                                                        {/* <span>{getDateWithDay(selecteditems.startDate)}</span> */}
                                                        <span>{getUserCurrentFormat(selecteditems.startDate)?.dateFormat}</span>
                                                    </Col>
                                                    <Col sm={6}>
                                                        <small>End date</small>

                                                        {/* <span>{getDateWithDay(selecteditems.endDate)}</span> */}
                                                        <span>{getUserCurrentFormat(selecteditems.endDate)?.dateFormat}</span>
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div className="bg-tertiary-blue py10">
                                                <Row className="p5">
                                                    <Col sm={6}>Communication type</Col>
                                                    <Col sm={6}>{selecteditems.attributeName}</Col>
                                                </Row>
                                            </div>
                                            <div className="p5 py10">
                                                <Row className="">
                                                    <Col sm={6}>Audience</Col>
                                                    <Col sm={6}>{numberWithCommas(selecteditems.totalRecipientsCount || 0)}</Col>
                                                </Row>
                                            </div>
                                            <div className="bg-tertiary-blue py10">
                                                <Row className="p5">
                                                    <Col sm={6}>Channels</Col>
                                                    <Col sm={6}>
                                                        <ul className="rs-list-inline rli-space-5">
                                                            {channelId?.map((item, indexs) => {
                                                                const channel = getChannelId(item);
                                                                return (
                                                                    <li key={channel?.value ?? item ?? indexs}>
                                                                        <RSTooltip position="top" text={channel?.label} className="mr15">
                                                                            <i
                                                                                className={`${channel?.icon} cursor-default icon-md color-primary-blue`}
                                                                            ></i>
                                                                        </RSTooltip>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Carousel.Item>
                                    );
                                return (
                                    <Carousel.Item key={selecteditems?.blastScheduleGuid}>
                                        <Card className="rs-planner-event-preview-card">
                                            {/* <h3 className="text-center">{selecteditems?.channelName}</h3> */}
                                            {/* {selecteditems.contentType === '' ? (
                                              <div>{selecteditems.content}</div>
                                            ) : (
                                                <div className="htmlContent">
                                                    {selecteditems.contentType === 'R' ? (
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: selecteditems.content,
                                                            }}
                                                        />
                                                    ) : (
                                                        
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: selecteditems.content,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )} */}

                                            {renderPlannerPreview(selecteditems)}
                                        </Card>
                                    </Carousel.Item>
                                );
                            })}
                        </Carousel>
                    )}
                </div>
            }
        />
    );
};

export default EventInfoModal;
