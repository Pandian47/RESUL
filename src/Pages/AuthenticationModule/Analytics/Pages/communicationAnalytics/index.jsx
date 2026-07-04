import { DROPDOWN_LIST, normalizeSummaryCommunicationTypeToIds, pickCommunicationSummaryRequestPayload } from './constant';
import { COMPLETED, GRID_VIEW, IN_PROGRESS, LIST_VIEW, SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { circle_grid_fill_edge_large, circle_list_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { cloneDeep, get as _get, isEqual } from 'Utils/modules/lodashReplacements';

import KendoGrid from 'Components/RSKendoGrid';
import ResGrid from 'Pages/KendoDocs/CommonComponents/ResGrid';
import AnalyticsListDetail from './AnalyticsListing/AnalyticsListDetail';
import RSAdvanceSearchNew, {
    buildAdvanceSearchPersistStorageKey,
    hasPersistedAdvanceFilters,
    isEntireMultiSelectChosen,
    resolveMyCommunicationsScopeFromStorage,
} from 'Components/AdvanceSearchNew';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import AnalyticsList from './AnalyticsListing';
import RSTooltip from 'Components/RSTooltip';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    analyticsListNameSearch,
    getAnalyticsInfoList,
    getCommunicationAnalyticsList,
    getAnalyticsInfoGrid,
} from 'Reducers/analytics/communicationAnalytics/request';
import { fetchAnalyticsAdvanceFilterOptions } from 'Pages/AuthenticationModule/Communication/CommunicationLists/loadCommunicationListingFilterOptions';
import { mapAnalyticsQueryOptionsResponseToOptionsState } from './analyticsQueryOptionsMapper';
import {
    buildAdvanceFilterConfig,
    buildSearchPayload,
    buildClearPayload,
    normalizeListingSortBy,
} from 'Pages/AuthenticationModule/Communication/CommunicationLists/Pages/Listings/constant';
import { getUserDetails } from 'Utils/modules/crypto';
import { getDateFormat, getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { coerceAnalyticsSummaryApiResult } from '../../analyticsDefaults';
import { normalizeCampaignStatusChannel } from 'Reducers/communication/listing/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import {
    COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS,
    COMMUNICATION_LISTING_DEFAULT_INITIAL_ACTIVE_FILTERS,
    DEFAULT_ADVANCE_SEARCH_SORT_BY_ID,
} from 'Constants/AdvanceSearch';
import { AnalyticsListRowsSkeleton } from 'Components/Skeleton/pages/analytics';
import { SkeletonCommunicationList } from 'Components/Skeleton/Components/SkeletonCommunicationList';
import { globalStateSelector } from 'Utils/Selectors/app';
import analyticsListingInitialState from 'Reducers/analytics/communicationAnalytics/initialState';

const ANALYTICS_SCOPE_DROPDOWN_DATA = ['All communications', 'My communications'];

const omitPaginationForRestPayload = (p) => {
    if (!p) return {};
    const { pagination, searchCommunicationName, ...rest } = p;
    return rest;
};

const mergeBuiltIntoAnalyticsPayload = (built, resetPage, paginationOverride) => (prev) => {
    const {
        index,
        pageSize,
        name,
        timezoneId: _omitBuiltTzId,
        timezoneid: _omitBuiltTzid,
        productCategoryId: _omitProductCategoryId,
        ...apiFields
    } = built;
    const { timezoneId: _omitPrevTzId, timezoneid: _omitPrevTzid, ...prevWithoutTz } = prev;
    const defaultPagination = {
        pageNo: resetPage ? 1 : prev.pagination?.pageNo ?? index ?? 1,
        pageSize: prev.pagination?.pageSize ?? pageSize ?? 5,
    };
    return {
        ...prevWithoutTz,
        ...apiFields,
        sortBy: normalizeListingSortBy(apiFields.sortBy ?? prev.sortBy),
        searchCommunicationName: name || '',
        pagination: paginationOverride ?? defaultPagination,
    };
};

const ANALYTICS_NAME_SEARCH_DEBOUNCE_MS = 400;
const ANALYTICS_NAME_SUGGEST_MIN_CHARS = 3;
const ANALYTICS_ADVANCE_SEARCH_OPTIONS = ['Communication name', 'Communication type', 'Delivery type'];

const CommunicationAnalytics = () => {
    const dispatch = useDispatch();
    // const utcTimeData = useSelector((state) => getUtcTimeData(state));
    
    // Use UTC time from API if available, otherwise fallback to system time
    // const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    const [analyticsListData, setAnalyticsListData] = useState({
        analyticsList: [],
        attributeList: [],
        productList: [],
    });
    const { showSessionModal } = useSelector((state) => globalStateSelector(state));
    const { licenseTypeId, isAgency } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const [listTypeView, setListTypeView] = useState(true);
    const { clientId, userId, departmentId, departmentName } = useSelector((state) => getSessionId(state));
    const { accountAdmin, company_clientId} = useSelector(({ globalstate }) => globalstate);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const { isLoading, isFailure, isGridLoading } = useSelector(
        (state) => state.analyticsListingReducer ?? analyticsListingInitialState,
    );
    const communicationOptions = useSelector(
        (state) => state.communicationPlanReducer?.communicationOptions ?? {},
    );
    const planDropdownsFetchedFor = useSelector(
        (state) => state.communicationPlanReducer?.planDropdownsFetchedFor ?? null,
    );
    const planDropdownCacheRef = useRef({ communicationOptions, planDropdownsFetchedFor });
    planDropdownCacheRef.current = { communicationOptions, planDropdownsFetchedFor };
    const [totalCampaigns, setTotalCampaigns] = useState(0);
    const [totalGridCampaigns, setTotalGridCampaigns] = useState(0);
    const [gridCampaigns, setGridCampaigns] = useState([]);
    const [pageInitialValue, setPageInitialValue] = useState({
        take: 5,
        skip: 0,
    });
    const isFirstRender = useRef(true);
    const [hasListSettled, setHasListSettled] = useState(false);
    const [hasGridSettled, setHasGridSettled] = useState(false);
    const listLoading = Boolean(isLoading) || !hasListSettled;
    const gridLoading = Boolean(isGridLoading) || !hasGridSettled;
    const loading = listTypeView ? listLoading : gridLoading;
    const noDataAvailable = listTypeView
        ? hasListSettled && (!analyticsListData?.analyticsList || analyticsListData?.analyticsList?.length === 0)
        : hasGridSettled && (!gridCampaigns || gridCampaigns?.length === 0);

    const analyticsListColumns = useMemo(
        () => [
            {
                cell: (props) => <AnalyticsList {...props} />,
            },
        ],
        [],
    );

    const gridViewSettings = useMemo(() => ({
        total: totalGridCampaigns,
    }), [totalGridCampaigns]);

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);


    const [dates, setDates] = useState({
        startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: new Date(),
        selectedDateText: 'Last 30 days',
    });
    const [isAdavnceSearch, setIsAdvanceSearch] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({});
    const [filterOptions, setFilterOptions] = useState({
        productType: [],
        communicationType: [],
        tags: [],
        users: [],
    });
    const filterOptionsRef = useRef(filterOptions);
    useEffect(() => {
        filterOptionsRef.current = filterOptions;
    }, [filterOptions]);
    const [payload, setpayload] = useState({
        clientId,
        userId,
        departmentId,
        deliveryMethod: '',
        communicationType: '',
        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: getYYMMDD(new Date()),
        productType: '',
        searchCommunicationName: '',
        statusId: '',
        tags: '',
        channelType: '',
        createdBy: String(userId),
        sortBy: DEFAULT_ADVANCE_SEARCH_SORT_BY_ID,
        timezoneid: getDateFormat().timeZoneId ?? 0,
        pagination: {
            pageNo: 1,
            pageSize: 5,
        },
    });
    const payloadRef = useRef(payload);
    /** Dedupe GetCommunicationSummaryList / grid when `payload` updates twice on mount (advance search + parent). */
    const lastSummaryListRequestRef = useRef(null);
    const lastSummaryGridRequestRef = useRef(null);
    const listTypeViewRef = useRef(listTypeView);
    const departmentNameForFetchRef = useRef(departmentName);
    const licenseTypeIdForFetchRef = useRef(licenseTypeId);
    const isAgencyAccountAdminForFetchRef = useRef(isAgencyAccountAdmin);
    const handleCommunicationAPIRef = useRef(null);
    const handleGridAPIRef = useRef(null);
    listTypeViewRef.current = listTypeView;
    departmentNameForFetchRef.current = departmentName;
    licenseTypeIdForFetchRef.current = licenseTypeId;
    isAgencyAccountAdminForFetchRef.current = isAgencyAccountAdmin;
    const currentRequestRef = useRef(null);
    const currentFiltersRef = useRef(currentFilters);
    const searchTextRef = useRef('');
    const analyticsSearchDebounceRef = useRef(null);
    const analyticsSuggestGenRef = useRef(0);
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [nameSuggestLoading, setNameSuggestLoading] = useState(false);
    const [searchValueSync, setSearchValueSync] = useState({ rev: 0, value: '' });
    const [myCommunicationsOnly, setMyCommunicationsOnly] = useState(true);
    const myCommunicationsOnlyRef = useRef(true);
    const persistAdvanceFiltersKey = useMemo(
        () => buildAdvanceSearchPersistStorageKey('comm-analytics', clientId, userId, departmentId),
        [clientId, userId, departmentId],
    );
    const persistAnalyticsMyCommKey = useMemo(
        () => `${persistAdvanceFiltersKey}:my-comm`,
        [persistAdvanceFiltersKey],
    );
    const syncAnalyticsMyCommunicationsScopeFromStorage = useCallback(() => {
        const next = resolveMyCommunicationsScopeFromStorage({
            persistFiltersStorageKey: persistAdvanceFiltersKey,
            persistMyCommScopeKey: persistAnalyticsMyCommKey,
            fallbackFromRef: myCommunicationsOnlyRef.current,
        });
        if (next !== myCommunicationsOnlyRef.current) {
            myCommunicationsOnlyRef.current = next;
            setMyCommunicationsOnly(next);
        }
        return next;
    }, [persistAdvanceFiltersKey, persistAnalyticsMyCommKey]);
    const handleMyCommunicationsToggleRef = useRef(async () => {});
    const analyticsAdvanceFilterConfigRef = useRef(null);

    useLayoutEffect(() => {
        if (!clientId || departmentId == null) return;
        try {
            const rawMyComm = localStorage.getItem(persistAnalyticsMyCommKey);
            if (rawMyComm === 'true' || rawMyComm === 'false') {
                const v = rawMyComm === 'true';
                setMyCommunicationsOnly(v);
                myCommunicationsOnlyRef.current = v;
                return;
            }
            setMyCommunicationsOnly(true);
            myCommunicationsOnlyRef.current = true;
        } catch {
            /* ignore */
        }
    }, [persistAdvanceFiltersKey, persistAnalyticsMyCommKey, clientId, departmentId]);

    useEffect(() => {
        if (clientId == null || departmentId == null) return;
        try {
            localStorage.setItem(persistAnalyticsMyCommKey, String(myCommunicationsOnly));
        } catch {
            /* ignore */
        }
    }, [myCommunicationsOnly, persistAnalyticsMyCommKey, clientId, departmentId]);

    useEffect(() => {
        payloadRef.current = payload;
    }, [payload]);
    useEffect(() => {
        lastSummaryListRequestRef.current = null;
        lastSummaryGridRequestRef.current = null;
    }, [departmentId, clientId, userId]);
    useEffect(() => {
        currentFiltersRef.current = currentFilters;
    }, [currentFilters]);
    useEffect(
        () => () => {
            if (analyticsSearchDebounceRef.current) {
                clearTimeout(analyticsSearchDebounceRef.current);
            }
        },
        [],
    );
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setDates({
            startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: new Date(),
            selectedDateText: 'Last 30 days',
        });
        setMyCommunicationsOnly(true);
        myCommunicationsOnlyRef.current = true;
        setCurrentFilters({});
        searchTextRef.current = '';
        setpayload((prev) => ({
            ...prev,
            departmentId: departmentId,
            clientId: clientId,
            userId,
            deliveryMethod: '',
            communicationType: '',
            startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: getYYMMDD(new Date()),
            productType: '',
            searchCommunicationName: '',
            statusId: '',
            tags: '',
            channelType: '',
            createdBy: String(userId),
            sortBy: DEFAULT_ADVANCE_SEARCH_SORT_BY_ID,
            timezoneid: getDateFormat().timeZoneId ?? 0,
            pagination: {
                pageNo: 1,
                pageSize: 5,
            },
        }));
    }, [departmentId, clientId, showSessionModal, userId]);
    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') setConfimrationModal(true);
        else {
            setConfimrationModal(false);
        }
    }, [departmentName]);

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            return;
        }
        if (isAgencyAccountAdmin) {
            setHasListSettled(true);
            setHasGridSettled(true);
            return;
        }
        const t = window.setTimeout(() => {
            if (listTypeViewRef.current) {
                void handleCommunicationAPIRef.current?.();
            } else {
                void handleGridAPIRef.current?.();
            }
        }, 0);
        return () => window.clearTimeout(t);
    }, [payload, departmentName, licenseTypeId, isAgencyAccountAdmin, listTypeView]);

    useEffect(() => {
        const loadFilterOptions = async () => {
            const scope = { clientId, userId, departmentId };
            const { analyticsApiBody, users } = await fetchAnalyticsAdvanceFilterOptions(dispatch, scope);
            const temp = mapAnalyticsQueryOptionsResponseToOptionsState(analyticsApiBody, users, {
                dedupeUsers: true,
            });
            setFilterOptions(temp);
            setAnalyticsListData((pre) => ({
                ...pre,
                attributeList: temp.communicationType,
                productList: temp.productType,
            }));
        };
        if (clientId && departmentId) {
            loadFilterOptions();
        }
    }, [clientId, userId, departmentId, dispatch]);
    const handleCommunicationAPI = async () => {
        const summaryPayload = {
            ...payloadRef.current,
            communicationType: normalizeSummaryCommunicationTypeToIds(
                payloadRef.current.communicationType,
                filterOptionsRef.current?.communicationType,
            ),
        };
        const requestBody = pickCommunicationSummaryRequestPayload(summaryPayload);
        if (
            lastSummaryListRequestRef.current != null &&
            isEqual(lastSummaryListRequestRef.current, requestBody)
        ) {
            setHasListSettled(true);
            return;
        }
        lastSummaryListRequestRef.current = cloneDeep(requestBody);
        const currentPayload = JSON.stringify(requestBody);
        currentRequestRef.current = currentPayload;
        try {
            const result = await dispatch(getCommunicationAnalyticsList(requestBody));
            if (currentRequestRef.current === currentPayload && result) {
                const { status, totalCampaigns, data } = coerceAnalyticsSummaryApiResult(result);
                if (status) {
                    const communicationList = (data?.campaignsList ?? []).map((item) => ({
                        ...item,
                        expanded: false,
                    }));
                    setAnalyticsListData((pre) => ({ ...pre, analyticsList: communicationList }));
                    setTotalCampaigns(totalCampaigns || 0);
                } else {
                    setAnalyticsListData((pre) => ({ ...pre, analyticsList: [] }));
                    setTotalCampaigns(0);
                }
            }
        } finally {
            if (currentRequestRef.current === currentPayload) {
                setHasListSettled(true);
            }
        }
    };

    const handleGridAPI = async () => {
        const summaryPayload = {
            ...payloadRef.current,
            communicationType: normalizeSummaryCommunicationTypeToIds(
                payloadRef.current.communicationType,
                filterOptionsRef.current?.communicationType,
            ),
        };
        const requestBody = pickCommunicationSummaryRequestPayload(summaryPayload);
        if (
            lastSummaryGridRequestRef.current != null &&
            isEqual(lastSummaryGridRequestRef.current, requestBody)
        ) {
            setHasGridSettled(true);
            return;
        }
        lastSummaryGridRequestRef.current = cloneDeep(requestBody);
        const currentPayload = JSON.stringify(requestBody);
        currentRequestRef.current = currentPayload;
        try {
            const resultData = await dispatch(getAnalyticsInfoGrid(requestBody, false));
            if (currentRequestRef.current === currentPayload && resultData) {
                if (resultData?.status) {
                    const gridList = resultData?.data?.campaignsList;
                    setGridCampaigns(Array.isArray(gridList) ? gridList : []);
                    setTotalGridCampaigns(Number(resultData?.totalCampaigns) || 0);
                } else {
                    setGridCampaigns([]);
                    setTotalGridCampaigns(0);
                }
            }
        } finally {
            if (currentRequestRef.current === currentPayload) {
                setHasGridSettled(true);
            }
        }
    };

    handleCommunicationAPIRef.current = handleCommunicationAPI;
    handleGridAPIRef.current = handleGridAPI;

    const expandChange = async ({ dataItem }) => {
        const itemId = dataItem?.campaignID || dataItem?.campaignGUID;

        if (!dataItem?.expanded) {
            const expandPayload = {
                clientId,
                userId,
                departmentId,
                campaignId: dataItem?.campaignID,
                campaignGuid: dataItem?.campaignGUID,
            };

            setAnalyticsListData((prevState) => {
                const dataInstance = (prevState.analyticsList || []).map((item) => {
                    const isTarget = item?.campaignID === itemId || item?.campaignGUID === itemId;
                    if (!isTarget) {
                        return { ...item, expanded: false, channelsLoading: false };
                    }
                    return {
                        ...item,
                        expanded: true,
                        channelsLoading: true,
                        channels: [],
                        isFailure: false,
                    };
                });
                return { ...prevState, analyticsList: dataInstance };
            });

            try {
                const expandResult = await dispatch(
                    getAnalyticsInfoList({ payload: expandPayload, loading: false }),
                );
                const status = Boolean(expandResult?.status ?? expandResult?.Status);
                const inner =
                    expandResult?.data != null && typeof expandResult.data === 'object'
                        ? expandResult.data
                        : {};
                const channels = (Array.isArray(inner?.campaignsListInfo) ? inner.campaignsListInfo : [])
                    .map(normalizeCampaignStatusChannel)
                    .filter(Boolean);

                setAnalyticsListData((prevState) => {
                    const dataInstance = (prevState.analyticsList || []).map((item) => {
                        const isTarget = item?.campaignID === itemId || item?.campaignGUID === itemId;
                        if (!isTarget) {
                            return { ...item, expanded: false, channelsLoading: false };
                        }
                        return {
                            ...item,
                            expanded: true,
                            channelsLoading: false,
                            channels: status ? channels : [],
                            isFailure: !status,
                        };
                    });
                    return { ...prevState, analyticsList: dataInstance };
                });
            } catch {
                setAnalyticsListData((prevState) => {
                    const dataInstance = (prevState.analyticsList || []).map((item) => {
                        const isTarget = item?.campaignID === itemId || item?.campaignGUID === itemId;
                        if (!isTarget) {
                            return { ...item, expanded: false, channelsLoading: false };
                        }
                        return {
                            ...item,
                            expanded: true,
                            channelsLoading: false,
                            channels: [],
                            isFailure: true,
                        };
                    });
                    return { ...prevState, analyticsList: dataInstance };
                });
            }
        } else {
            setAnalyticsListData((prevState) => {
                const dataInstance = (prevState.analyticsList || []).map((item) => ({
                    ...item,
                    expanded: false,
                    channelsLoading: false,
                }));
                return {
                    ...prevState,
                    analyticsList: dataInstance,
                };
            });
        }
    };

    const handleDatePickerChange = ({ startDate, endDate }) => {
        const currentPageSize = payloadRef.current?.pagination?.pageSize || 5;
        const dates = { startDate: getYYMMDD(startDate), endDate: getYYMMDD(endDate) };
        const scopeMy = syncAnalyticsMyCommunicationsScopeFromStorage();
        const built = buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: {
                ...omitPaginationForRestPayload(payloadRef.current),
                ...dates,
            },
            name: searchTextRef.current || payloadRef.current?.searchCommunicationName || '',
            departmentId,
            clientId,
            userId,
            pageSize: currentPageSize,
            overrides: { index: 1 },
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
            productFilterUsesTypeIds: true,
            communicationTypeUsesAttributeIds: true,
        });
        setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
        setPageInitialValue({
            take: currentPageSize,
            skip: 0,
        });
    };

    const runSearchWithName = (text) => {
        const currentPageSize = payloadRef.current?.pagination?.pageSize || 5;
        searchTextRef.current = text;
        const scopeMy = syncAnalyticsMyCommunicationsScopeFromStorage();
        const built = buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: omitPaginationForRestPayload(payloadRef.current),
            name: text,
            departmentId,
            clientId,
            userId,
            pageSize: currentPageSize,
            overrides: { index: 1 },
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
            productFilterUsesTypeIds: true,
            communicationTypeUsesAttributeIds: true,
        });
        setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
        setPageInitialValue({
            take: currentPageSize,
            skip: 0,
        });
        setIsAdvanceSearch(true);
    };

    const fetchAnalyticsNameSuggestions = useCallback(
        async (text, armGen) => {
            const trimmed = String(text ?? '').trim();
            if (trimmed.length < ANALYTICS_NAME_SUGGEST_MIN_CHARS) {
                analyticsSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                return;
            }
            if (armGen !== analyticsSuggestGenRef.current) return;
            setNameSuggestLoading(true);
            const pre = payloadRef.current;
            const searchPayload = {
                clientId: pre.clientId,
                userId: pre.userId,
                departmentId: pre.departmentId,
                searchText: trimmed,
                searchType: 'CommunicationList',
                startDate: pre.startDate,
                endDate: pre.endDate,
            };
            try {
                const response = await dispatch(
                    analyticsListNameSearch({ payload: searchPayload, loading: false }),
                );
                if (armGen !== analyticsSuggestGenRef.current) return;
                if (response?.status && response?.data != null) {
                    const raw = response?.data;
                    const parsed =
                        typeof raw === 'string' ? safeParseJSON(raw, []) : Array.isArray(raw) ? raw : [];
                    setNameSuggestions(Array.isArray(parsed) ? parsed : []);
                } else {
                    setNameSuggestions([]);
                }
            } catch {
                if (armGen !== analyticsSuggestGenRef.current) return;
                setNameSuggestions([]);
            } finally {
                if (armGen === analyticsSuggestGenRef.current) {
                    setNameSuggestLoading(false);
                }
            }
        },
        [dispatch],
    );

    const handleAdvanceCommunicationNameSearchChange = useCallback(
        (value) => {
            const trimmed = String(value ?? '').trim();
            if (analyticsSearchDebounceRef.current) {
                clearTimeout(analyticsSearchDebounceRef.current);
                analyticsSearchDebounceRef.current = null;
            }
            if (trimmed.length < ANALYTICS_NAME_SUGGEST_MIN_CHARS) {
                analyticsSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                return;
            }
            analyticsSuggestGenRef.current += 1;
            const armGen = analyticsSuggestGenRef.current;
            setNameSuggestions([]);
            setNameSuggestLoading(true);
            analyticsSearchDebounceRef.current = setTimeout(() => {
                analyticsSearchDebounceRef.current = null;
                void fetchAnalyticsNameSuggestions(trimmed, armGen);
            }, ANALYTICS_NAME_SEARCH_DEBOUNCE_MS);
        },
        [fetchAnalyticsNameSuggestions],
    );

    const dismissAdvanceCommunicationNameSuggest = useCallback(() => {
        if (analyticsSearchDebounceRef.current) {
            clearTimeout(analyticsSearchDebounceRef.current);
            analyticsSearchDebounceRef.current = null;
        }
        analyticsSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
    }, []);

    const analyticsAdvanceFilterConfig = useMemo(
        () =>
            buildAdvanceFilterConfig(filterOptions, userId, {
                restrictStatusToAnalytics: true,
            }),
        [filterOptions, userId],
    );
    analyticsAdvanceFilterConfigRef.current = analyticsAdvanceFilterConfig;

    const buildTopSearchFilters = useCallback((type, raw, row) => {
        if (!type || type === 'Communication name') return currentFiltersRef.current || {};
        const filter = analyticsAdvanceFilterConfigRef.current?.find((f) => f.label === type);
        const text = String(raw ?? '').trim();
        if (!filter || !text) return currentFiltersRef.current || {};
        const data = Array.isArray(filter.data) ? filter.data : [];
        const resolvedRow =
            row ??
            find((item) => {
                const label = filter.isObject ? _get(item, filter.fieldKey || 'name', '') : item;
                return String(label ?? '').trim().toLowerCase() === text.toLowerCase();
            }) ??
            text;
        return {
            ...(currentFiltersRef.current || {}),
            [filter.key]: {
                displayValue: text,
                rawValue: filter.isMulti ? [resolvedRow] : resolvedRow,
            },
        };
    }, []);

    const commitAnalyticsNameSearchImmediate = (raw, meta = {}) => {
        if (analyticsSearchDebounceRef.current) {
            clearTimeout(analyticsSearchDebounceRef.current);
            analyticsSearchDebounceRef.current = null;
        }
        analyticsSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const text = String(raw ?? '').trim();
        if (meta?.type && meta.type !== 'Communication name') {
            const pre = payloadRef.current;
            const filters = buildTopSearchFilters(meta.type, text, meta.searchValue);
            const scopeMy = syncAnalyticsMyCommunicationsScopeFromStorage();
            searchTextRef.current = '';
            setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: text }));
            const built = buildSearchPayload({
                filters,
                restPayload: omitPaginationForRestPayload(pre),
                name: '',
                departmentId,
                clientId,
                userId,
                pageSize: pre.pagination?.pageSize || 5,
                overrides: {
                    index: 1,
                    startDate: pre.startDate,
                    endDate: pre.endDate,
                },
                myCommunicationsOnly: scopeMy,
                advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
                productFilterUsesTypeIds: true,
                communicationTypeUsesAttributeIds: true,
            });
            setCurrentFilters(filters);
            setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
            setPageInitialValue({
                take: pre.pagination?.pageSize || 5,
                skip: 0,
            });
            setIsAdvanceSearch(true);
            return;
        }
        // API call is triggered via `onFiltersChange` (Search button / Enter) to avoid duplicate calls.
        // Keep this handler for ref sync only.
        searchTextRef.current = text;
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: text }));
    };

    const handleAnalyticsSearchChange = (raw, selectedSearchType = 'Communication name') => {
        searchTextRef.current = raw;
        if (selectedSearchType !== 'Communication name') {
            if (analyticsSearchDebounceRef.current) {
                clearTimeout(analyticsSearchDebounceRef.current);
                analyticsSearchDebounceRef.current = null;
            }
            analyticsSuggestGenRef.current += 1;
            setNameSuggestions([]);
            setNameSuggestLoading(false);
            return;
        }
        if (analyticsSearchDebounceRef.current) {
            clearTimeout(analyticsSearchDebounceRef.current);
        }
        const trimmed = String(raw ?? '').trim();
        if (trimmed.length < ANALYTICS_NAME_SUGGEST_MIN_CHARS) {
            analyticsSuggestGenRef.current += 1;
            setNameSuggestions([]);
            setNameSuggestLoading(false);
            return;
        }
        analyticsSuggestGenRef.current += 1;
        const armGen = analyticsSuggestGenRef.current;
        setNameSuggestions([]);
        setNameSuggestLoading(true);
        analyticsSearchDebounceRef.current = setTimeout(() => {
            analyticsSearchDebounceRef.current = null;
            void fetchAnalyticsNameSuggestions(trimmed, armGen);
        }, ANALYTICS_NAME_SEARCH_DEBOUNCE_MS);
    };

    const handlePickAnalyticsName = (label) => {
        if (analyticsSearchDebounceRef.current) {
            clearTimeout(analyticsSearchDebounceRef.current);
            analyticsSearchDebounceRef.current = null;
        }
        analyticsSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const text = String(label ?? '').trim();
        searchTextRef.current = text;
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: text }));
        runSearchWithName(text);
    };

    const handleAnalyticsSearchExpandedChange = useCallback(
        (expanded) => {
            if (!expanded) {
                analyticsSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                if (analyticsSearchDebounceRef.current) {
                    clearTimeout(analyticsSearchDebounceRef.current);
                    analyticsSearchDebounceRef.current = null;
                }
                return;
            }
            if (hasPersistedAdvanceFilters(persistAdvanceFiltersKey)) return;
            if (myCommunicationsOnlyRef.current) return;
            myCommunicationsOnlyRef.current = true;
            setMyCommunicationsOnly(true);
            const pre = payloadRef.current;
            const currentPageSize = pre?.pagination?.pageSize || 5;
            const built = buildSearchPayload({
                filters: currentFiltersRef.current,
                restPayload: omitPaginationForRestPayload(pre),
                name: searchTextRef.current || pre.searchCommunicationName || '',
                departmentId,
                clientId,
                userId,
                pageSize: currentPageSize,
                overrides: {
                    index: 1,
                    startDate: pre.startDate,
                    endDate: pre.endDate,
                },
                myCommunicationsOnly: true,
                advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
                productFilterUsesTypeIds: true,
                communicationTypeUsesAttributeIds: true,
            });
            setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
            setPageInitialValue({
                take: currentPageSize,
                skip: 0,
            });
            setIsAdvanceSearch(true);
        },
        [departmentId, clientId, userId, persistAdvanceFiltersKey],
    );
    const handlePagerChange = (data) => {
        const nextState = data?.dataState ? data.dataState : data;
        const nextTake = nextState?.take ?? pageInitialValue?.take ?? 5;
        const nextSkip = nextState?.skip ?? 0;
        const size = nextSkip === 0 ? 1 : nextSkip / nextTake + 1;

        setPageInitialValue({ skip: nextSkip, take: nextTake });

        const pre = payloadRef.current;
        const scopeMy = syncAnalyticsMyCommunicationsScopeFromStorage();
        const built = buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: omitPaginationForRestPayload(pre),
            name: searchTextRef.current || pre.searchCommunicationName || '',
            departmentId,
            clientId,
            userId,
            pageSize: nextTake,
            overrides: {
                index: size,
                startDate: pre.startDate,
                endDate: pre.endDate,
            },
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
            productFilterUsesTypeIds: true,
            communicationTypeUsesAttributeIds: true,
        });
        setpayload(mergeBuiltIntoAnalyticsPayload(built, true, { pageNo: size, pageSize: nextTake }));
    };
    const handlePageChange = (data) => {
        let { take, skip } = data;
        const size = skip === 0 ? 1 : skip / take + 1;

        setPageInitialValue({ skip, take });

        const pre = payloadRef.current;
        const scopeMy = syncAnalyticsMyCommunicationsScopeFromStorage();
        const built = buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: omitPaginationForRestPayload(pre),
            name: searchTextRef.current || pre.searchCommunicationName || '',
            departmentId,
            clientId,
            userId,
            pageSize: take,
            overrides: {
                index: size,
                startDate: pre.startDate,
                endDate: pre.endDate,
            },
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
            productFilterUsesTypeIds: true,
            communicationTypeUsesAttributeIds: true,
        });
        setpayload(mergeBuiltIntoAnalyticsPayload(built, true, { pageNo: size, pageSize: take }));
    };

    const performFullClear = (pageSize, currentPayload) => {
        setMyCommunicationsOnly(true);
        myCommunicationsOnlyRef.current = true;
        const cleared = buildClearPayload({
            departmentId,
            clientId,
            userId,
            pageSize,
            startDate: currentPayload.startDate,
            endDate: currentPayload.endDate,
            listingDefaultScopeCreatedBy: true,
        });
        const { timezoneId: _omitClearedTzId, timezoneid: _omitClearedTzid, ...clearedWithoutTz } = cleared;
        setCurrentFilters({});
        currentFiltersRef.current = {};
        searchTextRef.current = '';
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
        setpayload((pre) => ({
            ...pre,
            ...clearedWithoutTz,
            searchCommunicationName: '',
            productType: '',
            pagination: {
                pageNo: 1,
                pageSize,
            },
        }));
        setPageInitialValue({
            take: pageSize,
            skip: 0,
        });
        setIsAdvanceSearch(false);
    };

    const handleClearFieldText = (status) => {
        const { searchCommunicationName } = payload;
        const hasActiveFilters =
            isAdavnceSearch ||
            Boolean(searchCommunicationName) ||
            Boolean(payload.deliveryMethod) ||
            Boolean(payload.communicationType) ||
            Boolean(payload.statusId) ||
            Boolean(payload.channelType) ||
            Boolean(payload.tags) ||
            Boolean(payload.productType);

        if (!status && hasActiveFilters) {
            performFullClear(payload?.pagination?.pageSize || 5, payload);
        }
    };
    const hanldeSearchClearField = async (status) => {
        if (analyticsSearchDebounceRef.current) {
            clearTimeout(analyticsSearchDebounceRef.current);
            analyticsSearchDebounceRef.current = null;
        }
        analyticsSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const currentPayload = payloadRef.current;
        const hasNonNameActiveFilters =
            isAdavnceSearch ||
            Boolean(
                currentFiltersRef.current &&
                Object.keys(currentFiltersRef.current).some((k) => k !== 'sort_type' && k !== 'communication_name'),
            ) ||
            Boolean(currentPayload.deliveryMethod) ||
            Boolean(currentPayload.communicationType) ||
            Boolean(currentPayload.statusId) ||
            Boolean(currentPayload.channelType) ||
            Boolean(currentPayload.tags) ||
            Boolean(currentPayload.productType);
        if (!status && hasNonNameActiveFilters) {
            performFullClear(currentPayload?.pagination?.pageSize || 5, currentPayload);
            return;
        }
        if (!status && (searchTextRef.current || currentPayload.searchCommunicationName)) {
            const currentPageSize = currentPayload?.pagination?.pageSize || 5;
            searchTextRef.current = '';
            setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
            const scopeMy = syncAnalyticsMyCommunicationsScopeFromStorage();
            const built = buildSearchPayload({
                filters: currentFiltersRef.current,
                restPayload: omitPaginationForRestPayload(payloadRef.current),
                name: '',
                departmentId,
                clientId,
                userId,
                pageSize: currentPageSize,
                overrides: { index: 1 },
                myCommunicationsOnly: scopeMy,
                advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
                productFilterUsesTypeIds: true,
                communicationTypeUsesAttributeIds: true,
            });
            setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
            setPageInitialValue({
                take: currentPageSize,
                skip: 0,
            });
        }
    };

    handleMyCommunicationsToggleRef.current = async (checked) => {
        setMyCommunicationsOnly(checked);
        myCommunicationsOnlyRef.current = checked;
        const pre = payloadRef.current;
        const currentPageSize = pre?.pagination?.pageSize || 5;
        const built = buildSearchPayload({
            filters: currentFiltersRef.current,
            restPayload: omitPaginationForRestPayload(pre),
            name: searchTextRef.current || pre.searchCommunicationName || '',
            departmentId,
            clientId,
            userId,
            pageSize: currentPageSize,
            overrides: { index: 1, startDate: pre.startDate, endDate: pre.endDate },
            myCommunicationsOnly: checked,
            advanceFilterConfig: analyticsAdvanceFilterConfigRef.current,
            productFilterUsesTypeIds: true,
            communicationTypeUsesAttributeIds: true,
        });
        setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
        setPageInitialValue({
            take: currentPageSize,
            skip: 0,
        });
        setIsAdvanceSearch(true);
    };

    const analyticsSupplementalFilterTags = useMemo(() => [], []);

    const handleAnalyticsFiltersChange = (filters, meta = {}) => {
        if (meta?.syncFiltersOnly) {
            currentFiltersRef.current = filters;
            setCurrentFilters(filters);
            return;
        }
        const createdByFilter = analyticsAdvanceFilterConfig.find((f) => f.key === 'created_by');
        const createdByRaw = filters?.created_by?.rawValue;
        let scopeMy;
        if (
            createdByFilter &&
            Array.isArray(createdByRaw) &&
            createdByRaw.length &&
            isEntireMultiSelectChosen(createdByFilter, createdByRaw)
        ) {
            setMyCommunicationsOnly(true);
            myCommunicationsOnlyRef.current = true;
            scopeMy = true;
        } else {
            scopeMy = syncAnalyticsMyCommunicationsScopeFromStorage();
        }
        setCurrentFilters(filters);
        if (!filters || Object.keys(filters).length === 0) {
            const pre = payloadRef.current;
            const currentPageSize = pre?.pagination?.pageSize || 5;
            searchTextRef.current = '';
            const built = buildSearchPayload({
                filters: {},
                restPayload: omitPaginationForRestPayload(pre),
                name: '',
                departmentId,
                clientId,
                userId,
                pageSize: currentPageSize,
                overrides: {
                    index: 1,
                    startDate: pre.startDate,
                    endDate: pre.endDate,
                },
                myCommunicationsOnly: scopeMy,
                advanceFilterConfig: analyticsAdvanceFilterConfig,
                productFilterUsesTypeIds: true,
                communicationTypeUsesAttributeIds: true,
            });
            setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
            setPageInitialValue({
                take: currentPageSize,
                skip: 0,
            });
            setIsAdvanceSearch(false);
            return;
        }

        const pre = payloadRef.current;
        const nameFromFilter = String(
            filters?.communication_name?.rawValue ?? filters?.communication_name?.displayValue ?? '',
        ).trim();
        const built = buildSearchPayload({
            filters,
            restPayload: omitPaginationForRestPayload(pre),
            name: nameFromFilter || searchTextRef.current,
            departmentId,
            clientId,
            userId,
            pageSize: pre.pagination?.pageSize || 5,
            overrides: {
                index: 1,
                startDate: pre.startDate,
                endDate: pre.endDate,
            },
            myCommunicationsOnly: scopeMy,
            advanceFilterConfig: analyticsAdvanceFilterConfig,
            productFilterUsesTypeIds: true,
            communicationTypeUsesAttributeIds: true,
        });
        setpayload(mergeBuiltIntoAnalyticsPayload(built, true));
        setPageInitialValue({
            take: pre.pagination?.pageSize || 5,
            skip: 0,
        });
        setIsAdvanceSearch(true);
    };

    return (
        // Contend holder starts
        <>
            {/* Main page heading block ends */}
            {/* Main page content block starts */}

            <Container className="page-content px0">
                {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                    <>
                        <div className="mt15">
                           <AnalyticsListRowsSkeleton />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer">
                            <RSAdvanceSearchNew
                                key={`${departmentId}-${clientId}-${userId}`}
                                disabled={loading}
                                persistActiveFilters
                                persistActiveFiltersStorageKey={persistAdvanceFiltersKey}
                                initialActiveFilters={COMMUNICATION_LISTING_DEFAULT_INITIAL_ACTIVE_FILTERS}
                                excludeActiveFilterTagKeys={COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS}
                                searchPlaceholder="Search communication"
                                advanceSearchOptions={ANALYTICS_ADVANCE_SEARCH_OPTIONS}
                                filterConfig={analyticsAdvanceFilterConfig}
                                supplementalFilterTags={analyticsSupplementalFilterTags}
                                onSearch={commitAnalyticsNameSearchImmediate}
                                onSearchChange={handleAnalyticsSearchChange}
                                onSearchExpandedChange={handleAnalyticsSearchExpandedChange}
                                onRefresh={() => hanldeSearchClearField(false)}
                                onClear={() => handleClearFieldText(false)}
                                onFiltersChange={handleAnalyticsFiltersChange}
                                searchSuggestions={nameSuggestions}
                                searchSuggestionsLoading={nameSuggestLoading}
                                onSearchSuggestionPick={handlePickAnalyticsName}
                                searchValueSync={searchValueSync}
                                minCharsForSearchSubmit={ANALYTICS_NAME_SUGGEST_MIN_CHARS}
                                lockMainBarWhenFilterChipsPresent
                                onAdvanceCommunicationNameSearchChange={handleAdvanceCommunicationNameSearchChange}
                                onAdvanceCommunicationNameSuggestDismiss={dismissAdvanceCommunicationNameSuggest}
                                dateRangeComponent={
                                    <span className={`rs-asn-date-scope${loading ? ' pe-none click-off' : ''}`}>
                                        <RSDateRangePicker
                                            onDatePickerClosed={handleDatePickerChange}
                                            isTemplate
                                        />
                                    </span>
                                }
                                auxiliaryRightControls={
                                    <div className={loading ? 'pe-none click-off' : ''}>
                                        <BootstrapDropdown
                                            data={ANALYTICS_SCOPE_DROPDOWN_DATA}
                                            defaultItem={
                                                myCommunicationsOnly
                                                    ? 'My communications'
                                                    : 'All communications'
                                            }
                                            alignRight
                                            containerClass="comm-listing-scope-dd"
                                            className="comm-listing-scope-dd__rs"
                                            onSelect={(item) => {
                                                const next = item === 'My communications';
                                                void handleMyCommunicationsToggleRef.current(next);
                                            }}
                                        />
                                    </div>
                                }
                                createButtonComponent={
                                    <RSTooltip
                                        text={listTypeView ? GRID_VIEW : LIST_VIEW}
                                        position="top"
                                        className="lh0"
                                    >
                                        <span
                                            className={`d-inline-flex lh0${loading ? ' pe-none click-off' : ''}`}
                                        >
                                            <i
                                                id="rs_CommunicationAnalytics_edge"
                                                className={`${
                                                    listTypeView
                                                        ? circle_grid_fill_edge_large
                                                        : circle_list_edge_large
                                                } icon-lg color-primary-blue icon-hover-shadow-primary`}
                                                onClick={() => {
                                                    if (!loading) setListTypeView(!listTypeView);
                                                }}
                                            />
                                        </span>
                                    </RSTooltip>
                                }
                            />
                        </div>
                        {loading ? (
                            <div className="mt15">
                                {listTypeView ? (
                                    <AnalyticsListRowsSkeleton />
                                ) : (
                                    <KendoGrid
                                        pageable
                                        data={[]}
                                        column={DROPDOWN_LIST}
                                        settings={gridViewSettings}
                                        config={pageInitialValue}
                                        isDataStateRequired
                                        isLoading
                                        change={handlePagerChange}
                                        flag
                                    />
                                )}
                            </div>
                        ) : (
                            <>
                                {(noDataAvailable && !loading) ? (
                                    listTypeView ? (
                                        <div className="mt15 rs-grid-listing">
                                            <SkeletonCommunicationList isError isLoading={false} />
                                        </div>
                                    ) : (
                                        <KendoGrid
                                            pageable
                                            data={[]}
                                            column={DROPDOWN_LIST}
                                            settings={gridViewSettings}
                                            config={pageInitialValue}
                                            isDataStateRequired
                                            change={handlePagerChange}
                                            flag
                                        />
                                    )
                                ) : (
                                    <>
                                        {listTypeView ? (
                                            <div>
                                                <ResGrid
                                                    key={`list-${totalCampaigns}-${pageInitialValue.skip}-${pageInitialValue.take}`}
                                                    layout="list"
                                                    listPreset="analytics"
                                                    skeletonVariant="analytics"
                                                    data={analyticsListData?.analyticsList}
                                                    columns={analyticsListColumns}
                                                    dataItemKey="campaignID"
                                                    detail={(props) => (
                                                        <AnalyticsListDetail
                                                            {...props}
                                                            onCollapse={(dataItem) =>
                                                                expandChange({ dataItem, dataIndex: props.dataIndex })
                                                            }
                                                        />
                                                    )}
                                                    expandField="expanded"
                                                    onExpandChange={(event) => expandChange(event)}
                                                    pageable
                                                    total={totalCampaigns}
                                                    dataState={pageInitialValue}
                                                    onDataStateChange={(event) => handlePageChange(event.dataState)}
                                                    isServerSide
                                                    className="custom-rspager"
                                                />
                                                {/* <ul className="rs-legend mt20">
                                                    <li>
                                                        <span className="rsl-status legend-inprogress"></span>
                                                        {IN_PROGRESS}
                                                    </li>
                                                    <li>
                                                        <span className="rsl-status legend-completed"></span>
                                                        {COMPLETED}
                                                    </li>
                                                </ul> */}
                                            </div>
                                        ) : (
                                            <>
                                                <>
                                                    <KendoGrid
                                                        key={`grid-${totalGridCampaigns}-${pageInitialValue.skip}-${pageInitialValue.take}`}
                                                        pageable={true}
                                                        data={gridCampaigns}
                                                        column={DROPDOWN_LIST}
                                                        settings={gridViewSettings}
                                                        config={pageInitialValue}
                                                        isDataStateRequired
                                                        isLoading={isGridLoading}
                                                        change={handlePagerChange}
                                                        flag={true}
                                                    />
                                                </>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>
            {/* Main page content block ends */}
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
        </>
        // Content holder ends
    );
};

export default CommunicationAnalytics;
