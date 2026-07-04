import { checkbox_mini, list_bar_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';

import CustomToggle from '../CustomToggle';
import RSTooltip from 'Components/RSTooltip';
import RSTertiaryButton from 'Components/Buttons/RSTertiaryButton';
import RSQuaternaryButton from 'Components/Buttons/RSQuaternaryButton';

import {
    getAlertsAndNotficationsDetail,
    markAllAsRead,
    updateNotificationCountStatus,
} from 'Reducers/notifications/request';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import { campaignProgressStatus } from 'Utils/modules/communicationStatus';
import { formatNumber } from 'Utils/modules/campaignUtils';
import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { getYYMMDD, convertUTCtoUserTimezone } from 'Utils/modules/dateTime';
import { getDaysOrHours } from 'Utils/modules/renewal';
import { handleCustomNavigationDetails } from 'Utils/modules/navigation';
import { numberWithCommas } from 'Utils/modules/formatters';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import useQueryParams from 'Hooks/useQueryParams';

const Notifications = () => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const unreadFetchInFlightRef = useRef(false);
    const { createdDate } = getUserDetails();
    const { renewalData } = useSelector(({ globalstate }) => globalstate);
    const utcTimeData = useSelector(getUtcTimeData);
    // Get current timezone-adjusted date from UTC API
    const currentUTCdateTime = utcTimeData?.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    const currentUserTimezoneDate = convertUTCtoUserTimezone(currentUTCdateTime);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const locationState = useQueryParams('/audience');
    const disableNavIcons = locationState?.needBUs && locationState?.fromLogin || renewalData?.isRenewal || false;
    const [notificationsData, setNotificationsData] = useState({
        notifications: [],
        unreadCount: 0,
        totalCount: 0,
        totalCountRaw: 0,
    });
    const [isFailure, setIsFailure] = useState({
        status: false,
        message: '',
    });
    const getNotifications = useCallback(async () => {
        if (!clientId || !userId || !departmentId || unreadFetchInFlightRef.current) return;

        unreadFetchInFlightRef.current = true;
        setNotificationsData(prev => ({
            ...prev,
            isLoading: true,
            isFailure: false,
        }));
        // const res = await dispatch(
        //     getAlertsAndNotficationsDetail({
        //         departmentId,
        //         clientId,
        //         userId,
        //         pagination: {
        //             pageNo: 1,
        //             pageSize: 5,
        //         },
        //         isDateFilter: false,
        //         dateFilter: {
        //             fromDate: getYYMMDD(new Date(createdDate)),
        //             toDate: getYYMMDD(new Date()),
        //         },
        //     }),
        // );
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        try {
            const countStatus = await dispatch(updateNotificationCountStatus({ payload }));
            if (countStatus?.status) {
                setNotificationsData(prev => ({
                    ...prev,
                    unreadCount: parseInt(countStatus?.data, 10),
                    isLoading: false
                }));
            } else {
                setNotificationsData(prev => ({
                    ...prev,
                    unreadCount: 0,
                    isLoading: false,
                    isFailure: true,
                }));
            }
        } finally {
            unreadFetchInFlightRef.current = false;
        }
    }, [clientId, departmentId, dispatch, userId]);

    const handleDropdownToggle = (isOpen) => {
        if (isOpen) {
            hadleNotification();
        }
    };

    const hadleNotification = async () => {
        setNotificationsData(prev => ({ 
            ...prev, 
            isLoading: true,
            isFailure: false,
        }));
        
        const res = await dispatch(
            getAlertsAndNotficationsDetail({
                departmentId,
                clientId,
                userId,
                pagination: {
                    pageNo: 1,
                    pageSize: 5,
                },
                isDateFilter: false,
                dateFilter: {
                    fromDate: getYYMMDD(new Date(createdDate)),
                    toDate: getYYMMDD(currentUserTimezoneDate),
                },
            }, false),
        );
        if (res?.status) {
            const tempCount = formatNumber(res?.totalRows);

            setNotificationsData(prev => ({
                ...prev,
                notifications: [...res?.data],
                totalCount: tempCount,
                totalCountRaw: res?.totalRows ?? 0,
                isLoading: false
            }));
        } else {
            setNotificationsData(prev => ({
                ...prev,
                notifications: [],
                totalCount: 0,
                totalCountRaw: 0,
                isLoading: false,
                isFailure: true,
            }));
        }
    };

    useEffect(() => {
        const scheduleDeferred = (callback, delayMs = 1500) => {
            if (typeof requestIdleCallback !== 'undefined') {
                return requestIdleCallback(callback, { timeout: Math.max(delayMs, 2000) });
            }
            return window.setTimeout(callback, delayMs);
        };
        const cancelDeferred = (handle) => {
            if (typeof cancelIdleCallback !== 'undefined' && typeof handle === 'number') {
                cancelIdleCallback(handle);
            } else {
                clearTimeout(handle);
            }
        };

        const unreadHandle = scheduleDeferred(() => {
            getNotifications();
        }, 3500);
        const utcHandle = scheduleDeferred(() => {
            dispatch(getUtcTimeNow());
        }, 3500);

        return () => {
            cancelDeferred(unreadHandle);
            cancelDeferred(utcHandle);
        };
    }, [departmentId, clientId, userId, dispatch, getNotifications]);

    const handleAllRead = async () => {
        setNotificationsData(prev => ({ 
            ...prev, 
            isLoading: true,
            isFailure: false,
        }));
        
        const payload = {
            departmentId,
            userId,
            clientId,
        };
        const res = await dispatch(markAllAsRead({ payload }));
        if (res?.status) {
            getNotifications();
        } else {
            setNotificationsData(prev => ({
                ...prev,
                isLoading: false,
                isFailure: true,
            }));
        }
    };

    return (
        <div className="rs-platform-dropdown-wrapper">
            <Dropdown className="rs-dropdown rsd-header" onToggle={handleDropdownToggle}>
                <Dropdown.Toggle as={CustomToggle} className="no-hover">
                    <RSTooltip text="Notifications" position="bottom" className="lh0">
                        <i className={`${list_bar_medium} icon-md white cursor-pointer`}></i>
                        {!!notificationsData?.unreadCount && (
                            <span className="label">{formatNumber(notificationsData?.unreadCount)}</span>
                        )}
                    </RSTooltip>
                </Dropdown.Toggle>
                <Dropdown.Menu renderOnMount>
                    <Dropdown.Item className="notification-header">

                        <span className='d-flex gap-1'>Notifications {notificationsData?.totalCountRaw > 1000 ? <RSTooltip text={numberWithCommas(notificationsData?.totalCountRaw)}>({notificationsData?.totalCount})</RSTooltip> : `(${notificationsData?.totalCountRaw})`}</span>

                        <div className={`position-absolute right10 ${disableNavIcons ? 'pe-none click-off' : ''}`}>
                            <i
                                className="icon-rs-settings-edge-mini"
                                onClick={() => {
                                    let finalState = {
                                        ...locationState,
                                        ...handleCustomNavigationDetails(locationState),
                                    };
                                    const encryptState = encodeUrl(finalState);
                                    navigate(`${'preferences/alerts-and-notifications'}?q=${encryptState}`, finalState);
                                }}
                            ></i>
                        </div>
                    </Dropdown.Item>
                    <div className='Notification-dropdown rs-notificaiton-skeleton css-scrollbar'>
                        {(notificationsData.isLoading || notificationsData?.isFailure || notificationsData?.notifications?.length === 0 ) ? (
                            [1, 2, 3, 4, 5, 6, 7]?.map((_, index) => (
                                <div key={index} className={'notification-status'}>
                                    <Dropdown.Item className="mt0">
                                        <div className="d-flex">
                                            <CommonSkeleton
                                                width={37}
                                                height={37}
                                                box
                                                mainClass="rs-notification-icon-wrapper bg-transparent"
                                            />
                                            <div className="rs-notification-content">
                                                <CommonSkeleton width={120} height={12} box />
                                                <CommonSkeleton width={80} height={12} box mt={8} />
                                            </div>
                                        </div>
                                        {(index === 2 && (notificationsData?.isFailure)) && ( <NoDataAvailableRender message='No data available'/>)}
                                        <div className={'notification-status-tick d-flex justify-content-end'}>
                                            <i
                                                className={ `${checkbox_mini} icon-mini`
                                                }
                                            />
                                            {/* <i
                                                className={   `${checkbox_mini} icon-mini nst-2  `
                                                }
                                            /> */}
                                        </div>
                                    </Dropdown.Item>
                                </div>
                            ))
                        ) : (
                            <>
                       {notificationsData?.notifications.map((notification) => {
                        const notificationType = campaignProgressStatus[notification.notificationTypeID];
                        const isRead = notification.readStatus === 'true';
                        return (
                            <div
                                className={isRead ? 'notification-status read' : 'notification-status unread'}
                                key={notification.notificationID}
                                //onClick={() => handleSingleRead(notification.notificationID)}
                            >
                                <Dropdown.Item key={notification.notificationID} className="mt0">
                                     {/* <div className={`${notificationType.rsClass} rs-notification-icon-wrapper`}>  */}

                                     <div className="d-flex">
                                     <div className={`${notificationType.rsClass} rs-notification-icon-wrapper`}>
                                        <i className={`${notificationType.rsIcon} icon-md`} />
                                    </div> 
                                    <div className="rs-notification-content">
                                        <p className="ellispis">{notification?.eventName}</p>
                                        <small className='fs12'>{getDaysOrHours(new Date(notification?.createdDate), currentUserTimezoneDate)}</small>
                                    </div>
                                    </div>
                                    <div className={'notification-status-tick d-flex justify-content-end'}>
                                        <i
                                            className={
                                                notification?.readStatus
                                                    ? `${checkbox_mini} icon-mini color-primary-green`
                                                    : `${checkbox_mini} icon-mini`
                                            }
                                        />
                                        {/* <i
                                            className={
                                                notification?.readStatus
                                                    ? `${checkbox_mini} icon-mini nst-2 color-primary-blue`
                                                    : `${checkbox_mini} icon-mini nst-2`
                                            }
                                        /> */}
                                    </div>
                                </Dropdown.Item>
                                {/* <Dropdown.Divider /> */}
                            </div>
                        );
                    })}
                            </>
                        )}
                    </div>
                    {!notificationsData.isLoading && notificationsData?.notifications?.length > 0 && (
                        <Dropdown.Item className="notification-footer mt0">
                            <RSTertiaryButton 
                                onClick={() => handleAllRead()} 
                                className="mr15"
                                disabled={notificationsData?.isLoading}
                                disabledClass={`${disableNavIcons ? 'pe-none click-off' :''}`}
                            >
                                Mark all as read
                            </RSTertiaryButton>
                            <RSQuaternaryButton
                                disabledClass={`${disableNavIcons ? 'pe-none click-off' : ''}`}
                                onClick={() => {
                                    let finalState = {
                                        ...locationState,
                                        ...handleCustomNavigationDetails(locationState),
                                    };
                                    const encryptState = encodeUrl(finalState);
                                    navigate(`${'preferences/notifications'}?q=${encryptState}`, finalState);
                                }}
                            >
                                View all
                            </RSQuaternaryButton>
                        </Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
            {/* {notifications.totalUnreadCount > 0 && <span className="label">{notifications?.totalUnreadCount}</span>} */}
            {/* <WarningPopup
                show={isFailure?.status}
                handleClose={() => {
                    setIsFailure({
                        status: false,
                        message: ''
                    });
                }}
                text={
                    <div>
                        {isFailure?.message}
                    </div>
                }
                showCancel={true}
                isPrimary={false}
            /> */}
        </div>
    );
};

export default memo(Notifications);