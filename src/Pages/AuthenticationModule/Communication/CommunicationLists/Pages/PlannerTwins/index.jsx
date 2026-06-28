import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { getYYMMDD, convertUTCtoUserTimezone } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
//Calendar
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import PlannerModal from './PlannerModal';
import CommunicationPlannerSkeleton from 'Components/Skeleton/pages/communication/planner/CommunicationPlannerSkeleton';
import { consumeCommunicationRouteSkeleton } from 'Components/Skeleton/pages/communication/communicationRouteSkeletonPhase';
import { convertDate, getCurrentMonthDate } from './constants';
import './planner.sass';
import EventInfoModal from './EventInfoModal';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';
import {
    campaignPlannerList,
    campaignPlannerSingleList,
    communicationAttributes,
    datePlannerSingleList,
} from 'Reducers/communication/planner/request';
import { useForm } from 'react-hook-form';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import ToolbarComponent from './ToolbarComponent';

import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import RSTooltip from 'Components/RSTooltip';
import {
    updatePlanner,
    setModalLoading,
    setModalFailure,
    setEventInfoLoading,
    setEventInfoFailure,
} from 'Reducers/communication/planner/reducer';
import { useNavigate } from 'react-router-dom';
import usePermission from 'Hooks/usePersmission';
import { getUtcTimeNow } from 'Reducers/globalState/request';

moment.locale('en-GB');
const localizer = momentLocalizer(moment);
const CommunicationPlanner = () => {
     const navigate = useNavigate();
    const dispatch = useDispatch();
     const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const { licenseTypeId, isAgency } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { control, reset, getValues, watch } = useForm();
    const render = useRef(true);
    const {
        plannerData,
        attributesData,
        campaignList,
        isLoading,
        modalLoading,
        modalFailure,
        eventInfoLoading,
        eventInfoFailure,
    } = useSelector(({ plannerReducer }) => plannerReducer);
    const skipPlannerOverlayRef = useRef(consumeCommunicationRouteSkeleton());
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const {accountAdmin, company_clientId} = useSelector(({ globalstate }) => globalstate);
    const utcTimeData = useSelector(getUtcTimeData);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    
    // Get UTC time and convert to user timezone
    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    const userTimezoneDate = utcTimeData.utcTime ? convertUTCtoUserTimezone(currentUTCdateTime) : new Date();
    
    const date = userTimezoneDate;
    const [currentDate, setCurrentDate] = useState(date);
    const currentMonth = getCurrentMonthDate(date);
    const [eventsData, setEventsData] = useState(plannerData);
    useEffect(() => {
        if (plannerData?.length > 0) {
            setEventsData(plannerData);
        }
    }, [plannerData]);

    // Call UTC time API on component mount
    useEffect(() => {
        dispatch(getUtcTimeNow());
    }, [dispatch]);

    // Override Date constructor to use timezone-adjusted date
    useEffect(() => {
        if (userTimezoneDate) {
            // Store original Date constructor
            const OriginalDate = window.Date;
            
            // Override Date constructor
            window.Date = function(...args) {
                if (args.length === 0) {
                    // When called without arguments (new Date()), return our timezone-adjusted date
                    return new OriginalDate(userTimezoneDate);
                }
                return new OriginalDate(...args);
            };
            
            // Copy static methods
            Object.setPrototypeOf(window.Date, OriginalDate);
            Object.defineProperty(window.Date, 'prototype', {
                value: OriginalDate.prototype,
                writable: false
            });
            
            // Store the original Date for restoration
            window._originalDate = OriginalDate;
            
            return () => {
                // Restore original Date constructor when component unmounts
                if (window._originalDate) {
                    window.Date = window._originalDate;
                    delete window._originalDate;
                }
            };
        }
    }, [userTimezoneDate]);
    const attributesList = attributesData?.length === 0 ? [] : attributesData;
    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') setConfimrationModal(true);
        else {
            setConfimrationModal(false);
        }
        return () => {
            dispatch(updatePlanner({ field: 'plannerData', data: [] }));
        };
    }, []);
    const [payload, setPayload] = useState({
        departmentId: departmentId,
        clientId,
        userId: userId,
        startDate: currentMonth.startDate,
        endDate: currentMonth.endDate,
        attributeId: 0,
        campaignId: 0,
        specificDate: '',
         isTwinsSearch: true, // for gallery twins
    });

    const [planner, setPlanner] = useState({
        popupEvent: null,
        popupShow: false,
        eventPopupShow: false,
        selectedDate: '',
        showMore: false,
    });
    // const defaultDate = useMemo(() => new Date('2023-10-26T13:45:00-05:00'), [])
    const attributesType = getValues('communicationType');
    const typeOfCommunication = getValues('type_communication');
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    useEffect(() => {
        let tempParams = {
            ...payload,
            departmentId: departmentId,
        };
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
        } else {
            if(!isAgencyAccountAdmin)
            dispatch(campaignPlannerList({ payload: tempParams }));
        }
    }, [payload, departmentId, clientId]);

    useEffect(() => {
        const payload = { departmentId, clientId, userId };
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
        } else {
            if(!isAgencyAccountAdmin)
            dispatch(communicationAttributes(payload));
        }
    }, [departmentId, clientId]);

    const handleChange = (option) => {
        setPayload((pre) => ({
            ...pre,
            attributeId: option.value.campaignAttributeId,
        }));
    };

    const handleTypeChange = (option) => {
        setPayload((pre) => ({
            ...pre,
            userId: option.value.id,
        }));
    };

    const handleSelectSlot = useCallback(
        ({ start, end }) => {
            const currentDate = convertDate(start);
            const singleDatePayload = {
                departmentId,
                clientId,
                userId,
                startDate: '',
                endDate: '',
                attributeId: attributesType?.id || 0,
                campaignId: 0,
                specificDate: currentDate,
         isTwinsSearch: true, // for gallery twins
            };
            dispatch(datePlannerSingleList(singleDatePayload, setPlanner));
        },
        [departmentId, clientId, userId, payload],
    );

    //Show single event
    const handleSelectEvent = (event) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            startDate: getYYMMDD(event?.start),
            endDate: getYYMMDD(event?.end),
            specificDate: '',
            attributeId: attributesType?.id || 0,
            campaignId: event?.campaignId,
         isTwinsSearch: true, // for gallery twins
        };
        dispatch(campaignPlannerSingleList({ payload, setPlanner }));
    };

    //Show '+ more data'
    const handleShowModal = (events, givenDate) => {
        const oneDayBefore = new Date(givenDate);
        dispatch(setModalLoading(false));
        dispatch(setModalFailure(false));
        setPlanner((pre) => ({
            ...pre,
            popupEvent: events,
            popupShow: true,
            showMore: true,
            selectedDate: oneDayBefore,
        }));
    };

    // Click on date
    const onNavigate = (navigateDate) => {
        const singleDatePayload = {
            departmentId,
            clientId,
            userId,
            startDate: '',
            endDate: '',
            attributeId: attributesType?.id || 0,
            campaignId: typeOfCommunication?.id || 0,
            specificDate: getYYMMDD(navigateDate),
        };
        dispatch(datePlannerSingleList(singleDatePayload, setPlanner));
    };

    const ToolBar = ({ onNavigate, date }) => {
        return (
            <ToolbarComponent
                control={control}
                setPayload={setPayload}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                reset={reset}
                onNavigate={onNavigate}
                date={date}
                watch={watch}
                render={render}
            />
        );
    };

    const components = useMemo(
        () => ({
            toolbar: ToolBar,
            event: ({ event }) => {
                const campaignName = event?.campaignName || '';
                return campaignName?.length > 15 ? (
                    <RSTooltip text={campaignName} position="top" innerContent={false}>
                        <span className="repo-label">{truncateTitle(campaignName, 15)}</span>
                    </RSTooltip>
                ) : (
                    <span className="repo-label">{campaignName}</span>
                );
            },
        }),
        [currentDate],
    );

    // const allEvents = dateViewsss?.reduce((acc, event) => {
    //     if (event.startDate === event.endDate) {
    //         return [...acc, event];
    //     } else {
    //         return [...acc, ...generateMultiDayEvents(event)];
    //     }
    // }, []);

    return (
        <div>
            {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                <>
                    <div className="mt15">
                        <RSSkeletonTable text={true} />
                    </div>
                </>
            ) : (
                <div>
                    <div className={`flex-row justify-content-end top-sub-heading ${isLoading ? 'opacity-50' : ''}`}>
                        <ul className="rs-list-inline rli-space-20">
                            <li>
                                <RSKendoDropdown
                                    name={'communicationType'}
                                    data={[{ attributename: 'All', campaignAttributeId: 0 }, ...attributesList]}
                                    textField="attributename"
                                    dataItemKey="campaignAttributeId"
                                    control={control}
                                    handleChange={handleChange}
                                    className={'kendo-dd-size-1'}
                                    defaultValue={{
                                        attributename: 'All',
                                        campaignAttributeId: 0,
                                    }}
                                />
                            </li>
                            <li>
                                <RSKendoDropdown
                                    name={'type_communication'}
                                    data={[
                                        {
                                            text: 'All communications',
                                            id: 0,
                                        },
                                        {
                                            text: 'My communications',
                                            id: userId,
                                        },
                                    ]}
                                    textField="text"
                                    dataItemKey="id"
                                    control={control}
                                    handleChange={handleTypeChange}
                                    defaultValue={{
                                        text: 'My communications',
                                        id: userId,
                                    }}
                                />
                            </li>
                            <li className={`addIconAlignment ${!addAccess ? 'click-off' : ''}`}>
                                <RSTooltip position="top" text="Create communication" className="lh0">
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                        onClick={() => {
                                            if (addAccess) {
                                                const newState = {
                                                    currentTab: null,
                                                    mode: 'create',
                                                };
                                                const encryptState = encodeUrl(newState);
                                                navigate(`/communication/communication-creation?q=${encryptState}`, {
                                                    state: { current: 'planner' }
                                                });
                                            }
                                        }}
                                    ></i>
                                </RSTooltip>
                            </li>
                        </ul>
                    </div>
                    <div className="rs-planner-calendar-wrapper mt13 mb20 position-relative">
                        {isLoading && !skipPlannerOverlayRef.current && (
                            <div className="rs-planner-skeleton-overlay">
                                <CommunicationPlannerSkeleton calendarOnly />
                            </div>
                        )}
                        <div className={`${isLoading ? 'opacity-50' : 'box-design py19'}`}>
                            <Calendar
                                // date={currentMonth}
                                localizer={localizer}
                                events={eventsData}
                                selectable
                                defaultDate={userTimezoneDate}
                                // onNavigate={onNavigate}
                                titleAccessor={'campaignName'}
                                startAccessor={'startDate'}
                                endAccessor={'startDate'}
                                onSelectEvent={handleSelectEvent}
                                onSelectSlot={handleSelectSlot}
                                onShowMore={handleShowModal}
                                views={['month']}
                                components={components}
                                showMultiDayTimes={false}
                            />

                            {/* <Calendar
                                views={['month']}
                                selectable
                                localizer={localizer}
                                defaultDate={new Date()}
                                events={eventsData}
                                // style={{ height: '100vh' }}
                                components={components}
                                titleAccessor={'campaignName'}
                                startAccessor={'startDate'}
                                endAccessor={'startDate'}
                                onSelectSlot={handleSelectSlot}
                                onSelectEvent={handleSelectEvent}
                                onShowMore={handleShowModal}
                            /> */}
                        </div>
                    </div>
                </div>
            )}
            {/* {planner.popupShow && ( */}
            <PlannerModal
                show={planner.popupShow}
                handleModalClose={(status) => {
                    if (!status) {
                        setPlanner((pre) => ({ ...pre, popupShow: false, showMore: false }));
                        dispatch(setModalLoading(false));
                        dispatch(setModalFailure(false));
                    }
                }}
                events={planner?.popupEvent}
                showMore={planner?.showMore}
                headingDate={planner.selectedDate}
                handleSelectEvent={handleSelectEvent}
                isLoading={modalLoading}
                isFailure={modalFailure}
            />
            {/* )} */}
            {/* {planner.eventPopupShow && ( */}
            <EventInfoModal
                show={planner.eventPopupShow}
                handleModalClose={(status) => {
                    if (!status) {
                        setPlanner((pre) => ({ ...pre, eventPopupShow: false }));
                        dispatch(setEventInfoLoading(false));
                        dispatch(setEventInfoFailure(false));
                    }
                }}
                selectedEvent={campaignList}
                isLoading={eventInfoLoading}
                isFailure={eventInfoFailure}
            />
            {/* )} */}
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </div>
    );
};

export default CommunicationPlanner;
