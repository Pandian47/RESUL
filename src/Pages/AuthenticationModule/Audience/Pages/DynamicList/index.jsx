import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { DYNAMIC_LIST_NOT_AVAILABLE_1, DYNAMIC_LIST_NOT_AVAILABLE_2, NOT_USED, USED } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, createContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DynamicGridView from './Components/DynamicGridView/DynamicGridView';
import DynamicHeaderView from './Components/DynamicHeaderView/DynamicHeaderView';
import RSPager from 'Components/RSPager';
import DynamicListView from './Components/DynamicListView/DynamicListView';

import { getDynamicListsData } from 'Reducers/audience/dynamicList/request';
import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';
import { getSessionId } from 'Reducers/globalState/selector';

import { getInitialAudienceSearchPayload, ListGridPageConfig, PAGE_CONFIG } from './constant';
import { Row } from 'react-bootstrap';
import { set_list_loading, set_list_failure, resetDynamicListState } from 'Reducers/audience/dynamicList/reducer';
import dynamicListInitialState from 'Reducers/audience/dynamicList/initialState';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import usePermission from 'Hooks/usePersmission';
import { useNavigate } from 'react-router-dom';
import { cloneDeep,debounce,isEqual } from 'Utils/modules/lodashReplacements';
import { AUDIENCE_LIST_DEFAULT_SORT_BY_ID, AUDIENCE_LIST_LAST_30_DAYS_OFFSET } from '../../audienceModuleDefaults';

export const DynamicListContext = createContext({
    setPagerPageConfig: () => { },
    setPageConfig: () => { },
    isClearSearch: false,
    setIsClearSearch: () => { },
    listTypeView: true,
    setInitialGridPagination: () => { },
    setListTypeView: () => { },
    params: {},
    setParams: () => { },
    pageConfig: ListGridPageConfig,
    isDateFilter: false,
    setisDateFilter: () => { },
    initialGridPagination: false,
});

const DynamicList = () => {
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dynamicListRequest = useApiLoader({
        actionCreator: getDynamicListsData,
    });
    const { licenseTypeId, isAudience, isAgency } = getUserDetails();
    const { dynamicListView, listLoading, listFailure } = useSelector(
        (state) => state?.dynamicListReducer ?? dynamicListInitialState,
    );
    const { failureApiErrors, accountAdmin, company_clientId } = useSelector(({ globalstate }) => globalstate);
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;

    const [listTypeView, setListTypeView] = useState(true);
    const [isDateFilter, setisDateFilter] = useState(false);
    const isFirstRender = useRef(true);
    const listTypeViewEffectDidMount = useRef(false);
    /** Deep-equality dedupe: JSON.stringify can differ for the same logical payload (key order), causing duplicate GetDynamicList. */
    const lastDispatchedDynamicListParamsRef = useRef(null);
    const debouncedDispatchDynamicList = useMemo(
        () =>
            debounce((tempParams) => {
                if (
                    lastDispatchedDynamicListParamsRef.current != null &&
                    isEqual(lastDispatchedDynamicListParamsRef.current, tempParams)
                ) {
                    return;
                }
                lastDispatchedDynamicListParamsRef.current = cloneDeep(tempParams);
                dynamicListRequest.refetch(tempParams);
            }, 0),
        [dynamicListRequest.refetch],
    );
    const [initialGridPagination, setInitialGridPagination] = useState(false);
    const [headerView, SetheadrerView] = useState(false);
    const [pagerPageConfig, setPagerPageConfig] = useState(PAGE_CONFIG);
    const [pageConfig, setPageConfig] = useState(ListGridPageConfig);
    const [params, setParams] = useState({
        departmentId: departmentId,
        clientId,
        userId: userId,
        pagination: { pageNo: 1, pageSize: 9 },
        isFilteration: true,
        filteration: {
            listName: '',
            listType: '',
            createdBy: '',
            approvalStatus: '',status: '',
            searchBy: '',
            searchValue: '',
            isContains: false,
            isDateFilter: true,
            sortBy: AUDIENCE_LIST_DEFAULT_SORT_BY_ID,
            dateFilter: {
                fromDate: getYYMMDD(getDateWithDaynoFormat(AUDIENCE_LIST_LAST_30_DAYS_OFFSET)),
                toDate: getYYMMDD(new Date()),
            },
        },
        isAdvanceSearch: true,
    });
    const [isClearSearch, setIsClearSearch] = useState(false);

    useEffect(() => {
        if (listTypeViewEffectDidMount.current) {
            setPageConfig(() => ({
                listPageNo: 1,
                listSize: 9,
                gridPageNo: 1,
                gridSize: 5,
            }));
            setPagerPageConfig(PAGE_CONFIG);
        } else {
            listTypeViewEffectDidMount.current = true;
        }
        return () => {
            dispatch(set_list_loading(true));
            dispatch(set_list_failure(false));
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

    // Reset pagination when date filter changes (skip no-op updates on mount so the list API is not called twice)
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
        lastDispatchedDynamicListParamsRef.current = null;
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        const pageNoKey = listTypeView ? 'listPageNo' : 'gridPageNo';
        const pageSizeKey = listTypeView ? 'listSize' : 'gridSize';
        // Use pageConfig as the source of truth for pagination
        // pageConfig is updated both when user manually changes pagination and when filters change (preserving pagination)
        let tempParams = {
            ...params,
            pagination: {
                pageNo: pageConfig?.[pageNoKey] || 1,
                pageSize: pageConfig?.[pageSizeKey] || (listTypeView ? 9 : 3),
            },
            departmentId: departmentId,
            isAdvanceSearch: true,
        };
        const shouldFetch =
            (licenseTypeId !== '3' && !isAgencyAccountAdmin) ||
            (departmentId > 0 && !isAgencyAccountAdmin);
        if (!shouldFetch) return;
        debouncedDispatchDynamicList(tempParams);
        return () => debouncedDispatchDynamicList.cancel();
    }, [params, listTypeView, pageConfig, departmentId, licenseTypeId, isAgencyAccountAdmin, debouncedDispatchDynamicList]);

    useComponentWillUnmount(() => {
        debouncedDispatchDynamicList.cancel();
        resetAbortableRequests(dynamicListRequest);
        dispatch(resetDynamicListState());
    });

    const handlePageNumber = (data, skip, take) => {
        const size = skip === 0 ? 1 : skip / take + 1;
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
        setParams((prev) => ({
            ...prev,
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
    const pageSize = listTypeView ? 9 : 5;

    const value = useMemo(
        () => ({
            listTypeView,
            setListTypeView,
            params,
            setParams,
            pageConfig,
            setPageConfig,
            isDateFilter,
            setisDateFilter,
            setPagerPageConfig,
            isClearSearch,
            setIsClearSearch,
            setInitialGridPagination,
            initialGridPagination,
        }),
        [listTypeView, params, isDateFilter, pageConfig, isClearSearch, initialGridPagination],
    );
    return (
        <Fragment>
            <DynamicListContext.Provider value={value}>
                {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                    <>
                        <div className="mt15">
                            <RSSkeletonTable text={true} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className={headerView ? 'click-off' : ''}>
                            <DynamicHeaderView
                                listTypeView={listTypeView}
                                params={params}
                                setParams={setParams}
                                pageConfig={pageConfig}
                                setListTypeView={setListTypeView}
                                isDateFilter={isDateFilter}
                                setisDateFilter={setisDateFilter}
                                setInitialGridPagination={setInitialGridPagination}
                            />
                        </div>

                        {isAudience === 0 && !listLoading && !dynamicListView?.list?.length ? (
                            <RSSkeletonTable
                                count={7}
                                text
                                isAlertIcon={false}
                                message={
                                    <>
                                        {DYNAMIC_LIST_NOT_AVAILABLE_1}
                                        <i
                                            onClick={() => {
                                                if (addAccess) {
                                                    navigate('/audience/create-dynamic-list', {
                                                        state: { mode: 'add' },
                                                    });
                                                }
                                            }}
                                            className={`${
                                                departmentName?.toLowerCase() === 'all' && licenseTypeId == '3'
                                                    ? 'click-off'
                                                    : ''
                                            } ${circle_plus_fill_medium} icon-md px5 color-primary-blue`}
                                            id="rs_data_circle_plus_fill"
                                            style={{
                                                cursor:
                                                    addAccess &&
                                                    !(
                                                        departmentName?.toLowerCase() === 'all' &&
                                                        licenseTypeId == '3'
                                                    )
                                                        ? 'pointer'
                                                        : 'default',
                                            }}
                                        />
                                        {DYNAMIC_LIST_NOT_AVAILABLE_2}.
                                    </>
                                }
                            />
                        ) : (
                            <Fragment>
                                {listTypeView ? (
                                    <DynamicListView
                                        listTypeView={listTypeView}
                                        listLoading={listLoading}
                                        params={params}
                                        pageConfig={pageConfig}
                                        SetheadrerView={SetheadrerView}
                                    />
                                ) : (
                                    <DynamicGridView
                                        params={params}
                                        setParams={setParams}
                                        setPageConfig={setPageConfig}
                                        pageConfig={pageConfig}
                                        initialGridPagination={initialGridPagination}
                                        setInitialGridPagination={setInitialGridPagination}
                                        listTypeView={listTypeView}
                                    />
                                )}
                                {dynamicListView?.count > 9 && listTypeView && (
                                    <Row>
                                        <RSPager
                                            data={dynamicListView?.list}
                                            change={(data, skip, take) => handlePageNumber(data, skip, take)}
                                            total={dynamicListView?.count}
                                            config={pagerPageConfig}
                                            className={'mt0'}
                                        />
                                    </Row>
                                )}
                            </Fragment>
                        )}
                        {listTypeView &&
                            <ul className="rs-legend mt20">
                                <li>
                                    <span className="rsl-status legend-scheduled"></span>
                                    {NOT_USED}
                                </li>
                                <li>
                                    <span className="rsl-status legend-completed"></span>
                                    {USED}
                                </li>
                            </ul>
                        }
                    </>
                )}
                {getWarningPopupMessage(failureApiErrors, dispatch)}
            </DynamicListContext.Provider>
        </Fragment>
    );
};

export default DynamicList;
