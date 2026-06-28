import { circle_list_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';



import CustomKendoGrid from 'Components/RSCustomKendoGrid';
import RSDateRangePicker from 'Components/RSDateRangePicker';

import { AUDIT_COLUMN_CONFIG } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getAuditLogList } from 'Reducers/analytics/auditLog/request';

import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';

const AuditLog = () => {
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    // const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const { isLoading, isFailure } = useSelector(({ auditLogReducer }) => auditLogReducer);
    
    // Use UTC time from API if available, otherwise fallback to system time
    // const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    
    const [auditLogData, setAuditLogData] = useState({
        data: [],
        total: 0,
        loading: true,
    });
    const { height, pageSize } = useWindowSize();
    const [initialPagination, setInitialPagination] = useState(false);
    const [currentGridState, setCurrentGridState] = useState({
        skip: 0,
        take: pageSize || 5,
    });

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);

    const [dates, setDates] = useState({
        startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: new Date(),
        selectedDateText: 'Last 30 days',
    });
    const prevDepartmentId = useRef(departmentId);
    const { isAgency } = getUserDetails();
    const { accountAdmin, company_clientId } = useSelector(({ globalstate }) => globalstate);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    // console.log('auditLogData: ', auditLogData);
    const [totalCount, setTotalcount] = useState(0);
    const loading = isLoading || isFailure || !auditLogData?.data?.length;
    const date = new Date();
    const start = getDateWithDaynoFormat(LAST30DAYS_DATEFILTER);

    const [payload, setpayload] = useState({
        departmentId: departmentId,
        clientId,
        userId,
        pagination: {
            pageNo: 1,
            pageSize: pageSize,
        },

        fromDate: getYYMMDD(start),
        toDate: getYYMMDD(new Date()),
    });
    useEffect(() => {
        if (!isAgencyAccountAdmin) handleAuditLog();
    }, [payload]);
    const handlePageSizeChange = (dataState) => {
        const { skip, take } = dataState;
        
        // Update current grid state to track pagination
        setCurrentGridState({
            skip: skip,
            take: take,
        });
        
        setpayload((prev) => ({
            ...prev,
            pagination: {
                pageNo: skip === 0 ? 1 : Math.floor(skip / take) + 1,
                pageSize: take,
            },
        }));
    };

    useSkipFirstRender(() => {
        const initialPageSize = pageSize || 5;
        setCurrentGridState({
            skip: 0,
            take: initialPageSize,
        });
        setpayload((pre) => ({
            ...pre,
            fromDate: getYYMMDD(start),
            toDate: getYYMMDD(new Date()),
            pagination: {
                pageNo: 1,
                pageSize: initialPageSize,
            },
        }));
        setDates({
            startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: new Date(),
            selectedDateText: 'Last 30 days',
        });
        setInitialPagination(true);
    }, [departmentId, clientId]);

    const handleAuditLog = async () => {
        setAuditLogData((pre) => ({
            ...pre,
            loading: true,
        }));
        let { status, data, overallcount } = await dispatch(
            getAuditLogList({ ...payload, departmentId: departmentId }),
        );
        if (status) {
            setTotalcount(parseInt(overallcount, 10));
            setAuditLogData({
                data: data,
                total: parseInt(overallcount, 10),
                loading: false,
            });
        } else {
            setAuditLogData({
                data: [],
                total: 0,
                loading: false,
            });
        }
    };

    const handleDatePickerChange = ({ startDate, endDate }) => {
        // Preserve current pagination instead of resetting
        const currentPageNo = currentGridState.skip === 0 ? 1 : Math.floor(currentGridState.skip / currentGridState.take) + 1;
        const currentPageSize = currentGridState.take || pageSize || 5;
        
        setpayload((pre) => ({
            ...pre,
            fromDate: getYYMMDD(startDate),
            toDate: getYYMMDD(endDate),
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
        setInitialPagination(false); // Don't reset pagination
    };
    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        const size = skip === 0 ? 1 : skip / take + 1;

        // Update current grid state to track pagination
        setCurrentGridState({
            skip: skip,
            take: take,
        });

        setpayload((prev) => ({
            ...prev,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
        }));
        setInitialPagination(false);
    };

    return (
        // Contend holder starts
        <div className="page-content-holder pt21">
            {/* Main page heading block starts */}
            {/* <RSPageHeader title="Audit log report" isBack backPath="/analytics" isHeaderLine rightCommonMenus /> */}
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0">
                <div className="flex-row justify-content-end mt0 top-sub-heading">
                    <ul className="rs-list-group-horizontal">
                        <li>
                            <RSDateRangePicker
                                onDatePickerClosed={handleDatePickerChange}
                                // startDate={dates.startDate}
                                // endDate={dates.endDate}
                                // selectedDateText={dates.selectedDateText}
                                isTemplate
                            />
                        </li>
                        {/* <li>
                            <i className={`${circle_list_edge_large} icon-lg color-primary-blue mr-5"`}></i>
                        </li> */}
                    </ul>
                </div>
                {/* {!!auditLogData?.length ? ( */}
                    <CustomKendoGrid
                        data={auditLogData?.data}
                        settings={{
                            total: auditLogData?.total,
                        }}
                        // isDataStateRequired
                        column={AUDIT_COLUMN_CONFIG}
                        onDataStateChange={(data) => handlePagerChange(data)}
                        pagerChange={initialPagination}
                        setInitialPagination={setInitialPagination}
                        filterable={true}
                        onPageSizeChange={handlePageSizeChange}
                        isLoading={auditLogData?.loading}
                    />
                {/* ) : (
                    <>
                        <RSSkeletonTable count={pageSize+1} text={!auditLogData?.loading}/>
                    </>
                )} */}
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default AuditLog;
