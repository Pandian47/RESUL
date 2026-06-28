import { getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

import RSPageHeader from 'Components/RSPageHeader';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import { notificationConfig } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import CustomKendoGrid from 'Components/RSCustomKendoGrid';


import { getSessionId } from 'Reducers/globalState/selector';
import { getAlertsAndNotficationsDetail } from 'Reducers/Notifications/request';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const AllNotifications = () => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { notificationsDetail } = useSelector(({ notificationsReducer }) => notificationsReducer);
    const { createdDate } = getUserDetails();
    const [initialPagination, setInitialPagination] = useState(false);
    const { pageSize } = useWindowSize();
    
    // Track current grid state for pagination preservation (source of truth)
    const [currentGridState, setCurrentGridState] = useState({
        skip: 0,
        take: pageSize || 5,
    });

    const [dates, setDates] = useState({
        startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: new Date(),
        selectedDateText: 'Last 30 days',
    });

    const [params, setParams] = useState({
        clientId,
        userId,
        pagination: {
            pageNo: 1,
            pageSize: pageSize,
        },
        isDateFilter: true,
        dateFilter: {
            fromDate: getYYMMDD(new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER))),
            toDate: getYYMMDD(new Date()),
        },
    });

    useSkipFirstRender(() => {
        setInitialPagination(true);
        setDates({
            startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: new Date(),
            selectedDateText: 'Last 30 days',
        });
        setParams((prev) => ({
            ...prev,
            clientId,
            userId,
            pagination: {
                pageNo: 1,
                pageSize: pageSize,
            },
            isDateFilter: true,
            dateFilter: {
                fromDate: getYYMMDD(new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER))),
                toDate: getYYMMDD(new Date()),
            },
        }));
        // Initialize currentGridState from params pagination
        const initialSkip = 0;
        const initialTake = pageSize || 5;
        setCurrentGridState({ skip: initialSkip, take: initialTake });
    }, [departmentId, clientId]);

    useEffect(() => {
        dispatch(getAlertsAndNotficationsDetail({ ...params, departmentId }));
    }, [params]);

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        
        // Update current grid state
        setCurrentGridState({ skip, take });
        
        setParams((prev) => ({
            ...prev,
            pagination: {
                pageNo: skip === 0 ? 1 : skip / take + 1,
                pageSize: take,
            },
        }));
    };

    const handleDateChange = (dates) => {
        // Preserve current pagination from currentGridState (source of truth)
        const currentPageSize = currentGridState?.take || params?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;
        
        setParams((prev) => ({
            ...prev,
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
            isDateFilter: true,
            dateFilter: {
                fromDate: getYYMMDD(dates.startDate),
                toDate: getYYMMDD(dates.endDate),
            },
        }));
        setInitialPagination(false);
    };

    const hasNotifications = !!notificationsDetail?.data?.notifications?.length;
    const showGridSkeleton = notificationsDetail?.isLoading && !hasNotifications;

    const handlePageSizeChange = (dataState) => {
        const { skip, take } = dataState;
        const pageNo = skip === 0 ? 1 : Math.floor(skip / take) + 1;
        
        // Update current grid state
        setCurrentGridState({ skip, take });
        
        setParams((prev) => ({
            ...prev,
            pagination: {
                pageNo: pageNo,
                pageSize: take,
            },
        }));
    };
    return (
        <div className="page-content-holder">
            <RSPageHeader title="Notifications" rightCommonMenus isBack backPath={`/preferences`} />
            <Container className="page-content px0">
                <div className="flex-row mt0 top-sub-heading">
                    <div className="fr flex-right tsh-icons">
                        <ul className="rs-list-group-horizontal jc-right">
                            <li>
                                <RSDateRangePicker
                                    onDatePickerClosed={(dates) => handleDateChange(dates)}
                                    startDate={dates?.startDate}
                                    endDate={dates?.endDate}
                                    selectedDateText={dates?.selectedDateText}
                                    isTemplate
                                />
                            </li>
                        </ul>
                    </div>
                </div>
                <PreferencesSubPageSkeletonGate
                    variant={PREFERENCES_SUBPAGE_VARIANT.NOTIFICATIONS_LIST}
                    isLoading={showGridSkeleton}
                >
                    <div>
                        {hasNotifications ? (
                            <CustomKendoGrid
                                data={notificationsDetail?.data?.notifications}
                                column={notificationConfig}
                                settings={{
                                    total: notificationsDetail?.data?.count,
                                }}
                                isDataStateRequired
                                pagerChange={initialPagination}
                                onDataStateChange={(data) => handlePagerChange(data)}
                                setInitialPagination={setInitialPagination}
                                onPageSizeChange={handlePageSizeChange}
                                isLoading={notificationsDetail?.isLoading}
                            />
                        ) : (
                            <RSSkeletonTable count={pageSize + 1} text={!notificationsDetail?.isLoading} />
                        )}
                    </div>
                </PreferencesSubPageSkeletonGate>
            </Container>
        </div>
    );
};

export default AllNotifications;
