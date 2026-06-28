import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { NEW_COMMUNICATION_S, ONGOING_COMMUNICATION_S } from 'Constants/GlobalConstant/Placeholders';
import { square_minus_fill_mini, square_plus_fill_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useState } from 'react';
import RSModal from 'Components/RSModal';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import PlannerModalSkeleton from 'Components/Skeleton/Components/PlannerModalSkeleton';

import RSTooltip from 'Components/RSTooltip';
import {
    normalizePlannerDayModalEvents,
    shouldShowPlannerModalEmpty,
} from 'Reducers/communication/planner/plannerModalUtils';

const PlannerModal = ({
    show,
    events,
    headingDate,
    handleModalClose,
    handleSelectEvent,
    showMore,
    isLoading = false,
    isFailure = false,
}) => {
    const dayEvents = useMemo(
        () => (showMore ? events : normalizePlannerDayModalEvents(events)),
        [events, showMore],
    );
    const onGointEvents = showMore ? events : dayEvents?.ongoingcampaignsPlannerList;
    const upComingEvents = showMore ? [] : dayEvents?.newcampaignsPlannerList;
    const [showEvent, setShowEvent] = useState({ eventData: false, onGoingCom: false });

    useEffect(() => {
        if (!show) return;
        setShowEvent({ eventData: false, onGoingCom: false });
    }, [show, headingDate]);

    const showContentSkeleton = isLoading || (!showMore && !isFailure && events == null);
    const showEmpty = shouldShowPlannerModalEmpty({
        events: showMore ? events : dayEvents,
        showMore,
        isFailure,
        isLoading,
    });

    return (
        <RSModal
            show={show}
            size="md"
            header={getUserCurrentFormat(headingDate)?.dateFormat}
            handleClose={handleModalClose}
            className="rs-planner-events-modal"
            body={
                <div className="rspem-wrapper">
                    {showContentSkeleton ? (
                        <PlannerModalSkeleton />
                    ) : showEmpty ? (
                        <NoDataAvailableRender className="rspem-no-data" />
                    ) : (
                        <div>
                            {!showMore && (
                                <div
                                    className="card mb10 m0 pb0"
                                    onClick={() => setShowEvent((pre) => ({ ...pre, eventData: !pre.eventData }))}
                                >
                                    <div className="">
                                        <div className="d-flex">
                                            <i
                                                className={`${
                                                    !showEvent.eventData
                                                        ? square_plus_fill_mini
                                                        : square_minus_fill_mini
                                                }  ${
                                                    !showEvent.eventData ? 'color-secondary-grey' : 'color-primary-blue'
                                                }  mt2 mr5 icon-md`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowEvent((pre) => ({ ...pre, eventData: !pre.eventData }));
                                                }}
                                            ></i>
                                            {NEW_COMMUNICATION_S}
                                            <span
                                                className={`badge badge-pill ml10 bg-${
                                                    !showEvent.eventData ? 'secondary-grey' : 'primary-blue'
                                                }  m-auto`}
                                            >
                                                {upComingEvents?.length ?? 0}
                                            </span>
                                        </div>
                                        <div
                                            className="accordion-collapse css-scrollbar mb10 "
                                            style={{ maxHeight: '240px' }}
                                        >
                                            {showEvent.eventData &&
                                                upComingEvents?.map((item, index) => {
                                                    return (
                                                        <Fragment key={index}>
                                                            <div
                                                                className="planner-body-card py7  px5"
                                                                onClick={() => handleSelectEvent(item)}
                                                            >
                                                                <span>{item.campaignName}</span>
                                                            </div>
                                                        </Fragment>
                                                    );
                                                })}
                                        </div>
                                        {!upComingEvents?.length && showEvent.eventData && (
                                            <div className="py50 text-center">
                                                <span>No events found</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div
                                className="card mb10 m0 pb0"
                                onClick={() => setShowEvent((pre) => ({ ...pre, onGoingCom: !pre.onGoingCom }))}
                            >
                                <div className="">
                                    <div className="d-flex ">
                                        <i
                                            className={`${
                                                !showEvent.onGoingCom
                                                    ? square_plus_fill_mini
                                                    : square_minus_fill_mini
                                            } ${
                                                !showEvent.onGoingCom ? 'color-secondary-grey' : 'color-primary-blue'
                                            }   mr5 icon-md`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowEvent((pre) => ({ ...pre, onGoingCom: !pre.onGoingCom }));
                                            }}
                                        ></i>
                                        {!showMore
                                            ? ONGOING_COMMUNICATION_S
                                            : NEW_COMMUNICATION_S}
                                        <span
                                            className={`px10 color-whites ml10  bg-${
                                                !showEvent.onGoingCom ? 'secondary-grey' : 'primary-blue'
                                            } m-auto`}
                                            style={{ borderRadius: '5px' }}
                                        >
                                            {onGointEvents?.length ?? 0}
                                        </span>
                                    </div>
                                    <div className="accordion-collapse css-scrollbar mb10" style={{ maxHeight: '240px' }}>
                                        {showEvent.onGoingCom &&
                                            onGointEvents?.map((item, index) => {
                                                return (
                                                    <Fragment key={index}>
                                                        <div
                                                            className="planner-body-card py7 px5"
                                                            onClick={() => handleSelectEvent(item)}
                                                        >
                                                            {item?.campaignName?.length > 30 ? (
                                                                <RSTooltip
                                                                    position="top"
                                                                    text={item?.campaignName}
                                                                    className="d-inline-block"
                                                                >
                                                                    <span>{truncateTitle(item?.campaignName, 30)}</span>
                                                                </RSTooltip>
                                                            ) : (
                                                                item?.campaignName
                                                            )}
                                                        </div>
                                                    </Fragment>
                                                );
                                            })}
                                    </div>
                                    {!onGointEvents?.length && showEvent.onGoingCom && (
                                        <div className="mt30  border-bottom text-center">
                                            <span>No events found</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
};

export default PlannerModal;
