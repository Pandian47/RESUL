import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserDateTimeFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';

import { ALL_AUDIENCE, NOT_USED, UPLOAD_PARENT_ATTRIBUTES, UPLOAD_PARENT_ATTRIBUTES_ADD_AUDIENCE, USED } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from 'react-bootstrap';
 
import TargetGridView from './Components/TargetGridView/TargetGridView';
import TargetHeaderView from './Components/TargetHeaderView/TargetHeaderView';
import TargetListView from './Components/TargetListView/TargetListView';
import { getTargetListView } from 'Reducers/audience/targetList/request';
import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';
import AudienceView from './Components/AudienceView';
import { getSessionId } from 'Reducers/globalState/selector';
import RSPager from 'Components/RSPager';
 
import { resetTargetListData, target_list_view } from 'Reducers/audience/targetList/reducer';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { getInitialAudienceSearchPayload, ListGridPageConfig, PAGE_CONFIG } from '../DynamicList/constant';
import usePermission from 'Hooks/usePersmission';
import { useNavigate, useLocation } from 'react-router-dom';
import { cloneDeep, debounce, isEqual } from 'Utils/modules/lodashReplacements';
import { AUDIENCE_LIST_DEFAULT_SORT_BY_ID, AUDIENCE_LIST_LAST_30_DAYS_OFFSET } from '../../audienceModuleDefaults';

const getTargetListInitialDateFilter = () => ({
    fromDate: getYYMMDD(getDateWithDaynoFormat(AUDIENCE_LIST_LAST_30_DAYS_OFFSET)),
    toDate: getYYMMDD(new Date()),
});
import { AudienceListProvider } from '../..';

export const TargetListContext = createContext({
    listTypeView: false,
    setListTypeView: () => {},
    params: {},
    setParams: () => {},
    setAudienceView: () => {},
    audienceView: {},
    isDateFilter: false,
    setisDateFilter: () => {},
    setPagerPageConfig: () => {},
    setInitialGridPagination: () => {},
    setPageConfig: () => {},
    initialGridPagination: false,
    pageConfig: {},
});

const TargetList = () => {
    const dispatch = useDispatch();
    const targetListRequest = useApiLoader({
        actionCreator: getTargetListView,
    });
    const { permissions } = usePermission();
    const { licenseTypeId, isCampaign, isAgency,isAudience } = getUserDetails();
    const { addAccess } = permissions || {};
    const navigate = useNavigate();
    const { pathname = '' } = useLocation() ?? {};

    const [listTypeView, setListTypeView] = useState(true);
    const [getPaginationGrid , setGetPaginationGrid] = useState(null);
    const [isDateFilter, setisDateFilter] = useState(false);
    const [audienceView, setAudienceView] = useState({
        listId: 0,
        listName: '',
        listType: 5,
        status: false,
    });
    const [lists, setLists] = useState([]);
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { failureApiErrors, accountAdmin, company_clientId } = useSelector(({ globalstate }) => globalstate);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const isDepartmentBlocked = departmentName?.toLowerCase() === 'all' && licenseTypeId === '3';
    const dateFormate = getUserDateTimeFormat();

    const navigateToAddAudience = useCallback(() => {
        if (!addAccess || !pathname) return;

        const stateRedirect = { from: 'master-data', index: 1 };
        try {
            const stateredirectEncode = encodeUrl(stateRedirect);
            navigate(`${pathname}/add-audience?q=${stateredirectEncode}`, { state: stateRedirect });
        } catch {
            navigate(`${pathname}/add-audience`, { state: stateRedirect });
        }
    }, [addAccess, navigate, pathname]);

    const isFirstRender = useRef(true);
    const lastDispatchedTargetListParamsRef = useRef(null);
    const licenseTypeIdFetchRef = useRef(licenseTypeId);
    const isAgencyAccountAdminFetchRef = useRef(isAgencyAccountAdmin);
    licenseTypeIdFetchRef.current = licenseTypeId;
    isAgencyAccountAdminFetchRef.current = isAgencyAccountAdmin;
    const debouncedDispatchTargetList = useMemo(
        () =>
            debounce((fullParams) => {
                if (
                    lastDispatchedTargetListParamsRef.current != null &&
                    isEqual(lastDispatchedTargetListParamsRef.current, fullParams)
                ) {
                    return;
                }
                lastDispatchedTargetListParamsRef.current = cloneDeep(fullParams);
                const lt = licenseTypeIdFetchRef.current;
                const agency = isAgencyAccountAdminFetchRef.current;
                const dept = fullParams?.departmentId;
                if (lt !== '3' && !agency) {
                    targetListRequest.refetch(fullParams);
                } else if (dept > 0 && !agency) {
                    targetListRequest.refetch(fullParams);
                }
            }, 0),
        [targetListRequest.refetch],
    );
    const [initialGridPagination, setInitialGridPagination] = useState(false);
    const [pagerPageConfig, setPagerPageConfig] = useState(PAGE_CONFIG);
    const [getPagination , setGetPagination] = useState(null);
    const [pageConfig, setPageConfig] = useState(ListGridPageConfig);
        const [params, setParams] = useState({
        departmentId: departmentId,
        clientId,
        userId: userId,
        pagination: {
            pageNo: 1,
            pageSize: 9,
        },
        isFilteration: true,
        isAdvanceSearch: true,
        filteration: {
            listName: '',
            listType: '',
            createdBy: '',
            approvalStatus: '',
            searchBy: '',
            searchValue: '',
            isContains: false,
            isDateFilter: true,
            sortBy: AUDIENCE_LIST_DEFAULT_SORT_BY_ID,
            dateFilter: {
                ...getTargetListInitialDateFilter(),
            },
            status:'',
        },
    });

    const { targetListView, totalListCount, message, listLoading, listFailure } = useSelector(
        ({ targetListViewReducer }) => targetListViewReducer,
    );
    const { setIsCompanyBUDisable = () => {} } = useContext(AudienceListProvider);
    useEffect(() => {
        setPageConfig(() => ({
            listPageNo: 1,
            listSize: 9,
            gridPageNo: 1,
            gridSize: 3,
        }));
        setPagerPageConfig(PAGE_CONFIG);
        return () => {
            dispatch(target_list_view({ field: 'listLoading', data: true }));
            dispatch(target_list_view({ field: 'listFailure', data: false }));
        };
    }, [listTypeView]);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (departmentName) {
            setPageConfig(ListGridPageConfig);
            setPagerPageConfig(PAGE_CONFIG);
            const getCloneDeep = () => {
                const clonedPayload = cloneDeep(getInitialAudienceSearchPayload());
                const {
                    filteration: { listType, ...otherFilterationValues },
                    ...otherValues
                } = clonedPayload;
                const updatedPayload = {
                    ...otherValues,
                    isAdvanceSearch: true,
                    filteration: {
                        ...otherFilterationValues,
                        listType: '',
                    },
                };
                return updatedPayload;
            };
            setParams({
                departmentId,
                clientId,
                userId,
                ...getCloneDeep(),
            });
            setisDateFilter(false);
        }
    }, [departmentName]);
    
    // Reset pagination when date filter changes (no-op if already page 1 / skip 0 — avoids duplicate getTargetListView)
    useEffect(() => {
        const pageNoKey = listTypeView ? 'listPageNo' : 'gridPageNo';
        setPageConfig((prev) => {
            if (prev[pageNoKey] === 1) return prev;
            return { ...prev, [pageNoKey]: 1 };
        });
        setPagerPageConfig((prev) => {
            if (prev.skip === 0) return prev;
            return { ...prev, skip: 0 };
        });
    }, [params.filteration?.dateFilter?.fromDate, params.filteration?.dateFilter?.toDate, listTypeView]);

    useEffect(() => {
        lastDispatchedTargetListParamsRef.current = null;
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        const pageNoKey = listTypeView ? 'listPageNo' : 'gridPageNo';
        const pageSizeKey = listTypeView ? 'listSize' : 'gridSize';
        const tempParams = {
            ...params,
            pagination: {
                pageNo: pageConfig?.[pageNoKey] || 1,
                pageSize: pageConfig?.[pageSizeKey] || (listTypeView ? 9 : 3),
            },
            departmentId: departmentId,
            isAdvanceSearch: true,
        };
        const fullParams = { ...tempParams, departmentId, clientId, userId };
        if (licenseTypeId !== '3' && !isAgencyAccountAdmin) {
            debouncedDispatchTargetList(fullParams);
        } else if (departmentId > 0 && !isAgencyAccountAdmin) {
            debouncedDispatchTargetList(fullParams);
        }
        return () => debouncedDispatchTargetList.cancel();
    }, [clientId, userId, params, listTypeView, pageConfig, departmentId, licenseTypeId, isAgencyAccountAdmin, debouncedDispatchTargetList]);

    useComponentWillUnmount(() => {
        debouncedDispatchTargetList.cancel();
        resetAbortableRequests(targetListRequest);
        dispatch(resetTargetListData());
    });
    const handlePageChange = (data, skip, take) => {
        const size = skip === 0 ? 1 : skip / take + 1;
        setGetPagination(take)

        setisDateFilter(false);
        if (listTypeView)
            setPageConfig((prev) => ({
                ...prev,
                listSize: take,
                listPageNo: size,
            }));
        else
            setPageConfig((prev) => ({
                ...prev,
                gridSize: take,
                gridPageNo: size,
            }));
        setParams((pre) => ({
            ...pre,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
        }));
        setPagerPageConfig((pre) => ({
            ...pre,
            skip,
            take,
        }));
    };

    useEffect(() => {
        if (audienceView?.status) {
            setIsCompanyBUDisable(true);
        } else {
            setIsCompanyBUDisable(false);
        }
    }, [audienceView]);

    const targetListContextValues = {
        listTypeView,
        setListTypeView,
        // lists,
        // setLists,
        params,
        setParams,
        setAudienceView,
        audienceView,
        isDateFilter,
        setisDateFilter,
        setPagerPageConfig,
        setInitialGridPagination,
        setPageConfig,
        pageConfig,
    };

    const value = useMemo(
        () => ({
            listTypeView,
            setListTypeView,
            // lists,
            // setLists,
            params,
            setParams,
            setAudienceView,
            audienceView,
            isDateFilter,
            setisDateFilter,
            setPagerPageConfig,
            setInitialGridPagination,
            setPageConfig,
            initialGridPagination,
            pageConfig,
        }),
        [listTypeView, params, isDateFilter, pageConfig, initialGridPagination, audienceView],
    );
    // if(true) {
    //     return <></>
    // }
    return (
        <Fragment>
            <TargetListContext.Provider value={value}>
                <div className={audienceView.status ? 'd-none' : undefined}>
                    {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                        <>
                            <div className="mt15">
                                <RSSkeletonTable text={true} />
                            </div>
                        </>
                    ) : (
                        <>
                            <TargetHeaderView
                                // targetListViewLen={targetListView?.length}
                                targetListViewLen = {getPagination}
                                isDateFilter={isDateFilter}
                                setisDateFilter={setisDateFilter}
                                params={params}
                                setParams={setParams}
                                pageConfig={pageConfig}
                                setListTypeView={setListTypeView}
                            />

                            {(isAudience === 0 && !listLoading && !targetListView?.length) ? (
                                <RSSkeletonTable
                                    count={7}
                                    text
                                    isAlertIcon={false}
                                    message={
                                        <>
                                            {UPLOAD_PARENT_ATTRIBUTES}
                                            <i
                                                onClick={navigateToAddAudience}
                                                className={`${isDepartmentBlocked ? 'click-off' : ''} ${circle_plus_fill_medium} icon-md px5 color-primary-blue`}
                                                id="rs_data_circle_plus_fill"
                                                style={{
                                                    cursor: addAccess && !isDepartmentBlocked ? 'pointer' : 'default',
                                                }}
                                            />
                                            {UPLOAD_PARENT_ATTRIBUTES_ADD_AUDIENCE}
                                        </>
                                    }
                                />
                            ) : (
                                <Fragment>
                                    {listTypeView ? (
                                        <TargetListView
                                            listTypeView={listTypeView}
                                            listLoading={listLoading}
                                            listFailure={listFailure}
                                            params={params}
                                            pageConfig={pageConfig}
                                        />
                                    ) : (
                                       <TargetGridView
                                        pageConfig={pageConfig}
                                        totalListCount={totalListCount}
                                        listLoading={listLoading}
                                        get_Pagination={(data) => {
                                            setGetPaginationGrid(data)
                                        }}
                                        />
                                    )}
                                    {/* {totalListCount > 9 && !pagerStatus && ( */}
                                    {totalListCount > 9 && listTypeView && (
                                        <Row>
                                            <RSPager
                                                data={targetListView}
                                                change={(data, skip, take) => handlePageChange(data, skip, take)}
                                                total={totalListCount}
                                                config={isDateFilter ? pagerPageConfig : pagerPageConfig}
                                                className ={'mt0'}
                                            />
                                            {listTypeView &&
                                              <ul className="rs-legend mt20">
                                    {/* <li>
                                        <span className="rsl-status legend-drafted"></span>Not used
                                    </li> */}
                                    <li>
                                        <span className="rsl-status legend-scheduled"></span>{NOT_USED}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-completed"></span>{USED}
                                    </li>
                                    <li>
                                        <span className="rsl-status legend-allAudience"></span>{ALL_AUDIENCE}
                                    </li>
                                </ul>
                                    }
                                        </Row>
                                    )}
                                  
                                </Fragment>
                            )}
                        </>
                    )}
                </div>
                {audienceView.status && <AudienceView />}

                {getWarningPopupMessage(failureApiErrors, dispatch)}
            </TargetListContext.Provider>
        </Fragment>
    );
};

export default TargetList;
