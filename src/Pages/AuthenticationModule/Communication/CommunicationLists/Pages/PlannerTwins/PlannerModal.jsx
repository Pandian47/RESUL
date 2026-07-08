import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import {
    NEW_COMMUNICATION_S,
    NO_EVENTS_FOUND,
    ONGOING_COMMUNICATION_S,
} from 'Constants/GlobalConstant/Placeholders';
import { square_minus_fill_mini, square_plus_fill_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useState } from 'react';
import RSModal from 'Components/RSModal';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import PlannerModalSkeleton from 'Components/Skeleton/Components/PlannerModalSkeleton';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import {
    normalizePlannerDayModalEvents,
    shouldShowPlannerModalEmpty,
} from 'Reducers/communication/planner/plannerModalUtils';

const PlannerSectionHeader = ({ isExpanded, title, count, onIconClick }) => (
    <div className="rspem-section-header d-flex align-items-center gap-2">
        <i
            className={`${
                isExpanded ? square_minus_fill_mini : square_plus_fill_mini
            } ${isExpanded ? 'color-primary-blue' : 'color-secondary-grey'} icon-md flex-shrink-0`}
            onClick={onIconClick}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onIconClick(event);
                }
            }}
        />
        <span className="rspem-section-title flex-grow-1">{title}</span>
        <span
            className={`rspem-section-count badge badge-pill flex-shrink-0 bg-${
                isExpanded ? 'primary-blue' : 'secondary-grey'
            }`}
        >
            {count ?? 0}
        </span>
    </div>
);

const PlannerEventSection = ({
    isExpanded,
    onToggle,
    title,
    count,
    events,
    onSelectEvent,
    truncateNames = false,
}) => (
    <div className="card rspem-section-card mb0" onClick={onToggle}>
        <div className="rspem-section">
            <PlannerSectionHeader
                isExpanded={isExpanded}
                title={title}
                count={count}
                onIconClick={(event) => {
                    event.stopPropagation();
                    onToggle();
                }}
            />
            {isExpanded ? (
                <div
                    className="rspem-section-panel"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    role="presentation"
                >
                    {events?.length ? (
                        <div className="rspem-section-body accordion-collapse css-scrollbar">
                            {events.map((item, index) => (
                                <div
                                    key={item?.campaignId ?? item?.blastScheduleGuid ?? index}
                                    className="planner-body-card py7 px5"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onSelectEvent(item);
                                    }}
                                >
                                    {truncateNames ? (
                                        <TruncatedCell
                                            value={item?.campaignName}
                                            noTable
                                            wrapperClassName="d-block"
                                        />
                                    ) : (
                                        <span>{item?.campaignName}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoDataAvailableRender
                            className="rspem-section-no-data"
                            message={NO_EVENTS_FOUND}
                        />
                    )}
                </div>
            ) : null}
        </div>
    </div>
);

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
        setShowEvent({ eventData: false, onGoingCom: Boolean(showMore) });
    }, [show, headingDate, showMore]);

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
                        <NoDataAvailableRender className="rspem-no-data" message={NO_EVENTS_FOUND} />
                    ) : (
                        <div className="rspem-sections">
                            {!showMore ? (
                                <PlannerEventSection
                                    isExpanded={showEvent.eventData}
                                    onToggle={() =>
                                        setShowEvent((pre) => ({ ...pre, eventData: !pre.eventData }))
                                    }
                                    title={NEW_COMMUNICATION_S}
                                    count={upComingEvents?.length}
                                    events={upComingEvents}
                                    onSelectEvent={handleSelectEvent}
                                />
                            ) : null}

                            <PlannerEventSection
                                isExpanded={showEvent.onGoingCom}
                                onToggle={() =>
                                    setShowEvent((pre) => ({ ...pre, onGoingCom: !pre.onGoingCom }))
                                }
                                title={showMore ? NEW_COMMUNICATION_S : ONGOING_COMMUNICATION_S}
                                count={onGointEvents?.length}
                                events={onGointEvents}
                                onSelectEvent={handleSelectEvent}
                                truncateNames
                            />
                        </div>
                    )}
                </div>
            }
        />
    );
};

export default PlannerModal;
