import { getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { handleAdvanceSearchDataFormat } from 'Utils/modules/navigation';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { CARD_VIEW, CREATE_NEW_DYNAMIC_LIST, GRID_VIEW, TABLE_LIST_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_grid_fill_edge_large, circle_list_edge_large, circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSAdvanceSearchNew, {
    buildAdvanceSearchPersistStorageKey,
    isEntireMultiSelectChosen,
} from 'Components/AdvanceSearchNew';
import { DynamicListContext } from '../..';
import dynamicListInitialState from 'Reducers/audience/dynamicList/initialState';
import targetListInitialState from 'Reducers/audience/targetList/initialState';

import { DYNAMIC_LIST_TYPE_OPTIONS } from './constant';

import {
    AUDIENCE_APPROVAL_STATUS_OPTIONS,
    AUDIENCE_DEFAULT_INITIAL_ACTIVE_FILTERS,
    AUDIENCE_STATUS_OPTIONS,
    COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS,
    buildAudienceListAdvanceFilterConfig,
} from '../../../../audienceAdvanceSearchDefaults';
import { AUDIENCE_LIST_DEFAULT_SORT_BY_ID } from '../../../../audienceModuleDefaults';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    applyAudiencePagination,
    buildAudiencePaginationClearDefaults,
    buildAudiencePaginationPreserve,
    buildAudiencePaginationReset,
} from '../../constant';
import { AUDIENCE_LIST_LAST_30_DAYS_OFFSET } from '../../../../audienceModuleDefaults';
import { getTLDLUserNameList, normalizeTLDLUserListRows } from 'Reducers/audience/targetList/request';
import { getSearchDropdownData } from 'Reducers/audience/dynamicList/request';
import { target_list_view } from 'Reducers/audience/targetList/reducer';

const LIST_NAME_SUGGEST_DEBOUNCE_MS = 400;
const LIST_NAME_SUGGEST_MIN_CHARS = 3;
const DYNAMIC_ADVANCE_SEARCH_OPTIONS = ['List name', 'Created by'];

const hasDynamicAdvanceFilterFields = (formState = {}) =>
    Boolean(
        formState.list_type?.length ||
            formState.approval_status?.length ||
            formState.status?.length ||
            formState.created_by?.length ||
            (formState.sort_type != null && formState.sort_type !== AUDIENCE_LIST_DEFAULT_SORT_BY_ID),
    );

const resolveDynamicIsAdvanceSearch = (meta = {}, formState = {}) => {
    if (meta?.isAdvanceSearch != null) {
        return Boolean(meta.isAdvanceSearch);
    }
    return hasDynamicAdvanceFilterFields(formState);
};

const buildDynamicAudienceFormStateFromFilters = (filters = {}) => {
    const formState = {
        communication_name_text: String(
            filters.communication_name?.rawValue ?? filters.communication_name?.displayValue ?? '',
        ).trim(),
        list_type: filters.list_type?.rawValue?.length ? filters.list_type.rawValue : [],
        approval_status: filters.approval_status?.rawValue?.length ? filters.approval_status.rawValue : [],
        status: filters.status?.rawValue?.length ? filters.status.rawValue : [],
        created_by: filters.created_by?.rawValue?.length ? filters.created_by.rawValue : [],
    };
    if (filters.sort_type != null) {
        const raw = filters.sort_type.rawValue;
        const sortCandidate = raw != null && typeof raw === 'object' ? raw.id ?? raw : raw;
        const sortId = Number(sortCandidate);
        if (Number.isFinite(sortId)) {
            formState.sort_type = sortId;
        }
    }
    return formState;
};

// var searchBy = '';

const DYNAMIC_LIST_TYPE_FILTER_META = {
    key: 'list_type',
    data: DYNAMIC_LIST_TYPE_OPTIONS,
    isObject: false,
    fieldKey: 'name',
};

const AUDIENCE_APPROVAL_STATUS_FILTER_META = {
    key: 'approval_status',
    data: AUDIENCE_APPROVAL_STATUS_OPTIONS,
    isObject: false,
    fieldKey: 'name',
};
 
const AUDIENCE_STATUS_FILTER_META = {
    key: 'status',
    data: AUDIENCE_STATUS_OPTIONS,
    isObject: false,
    fieldKey: 'name',
};

const DynamicHeaderView = (props) => {
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const dispatch = useDispatch();
    const { addAccess } = permissions || {};
    const { isAudience } = getUserDetails();
    const {
        setPagerPageConfig,
        setPageConfig,
        setListTypeView,
        listTypeView,
        setParams,
        params,
        isDateFilter,
        setisDateFilter,
        setInitialGridPagination: setInitialGridPaginationFromContext,
        pageConfig,
        clearLastDispatchedDynamicListParams,
    } = useContext(DynamicListContext);
    const setInitialGridPagination =
        typeof setInitialGridPaginationFromContext === 'function'
            ? setInitialGridPaginationFromContext
            : typeof props.setInitialGridPagination === 'function'
              ? props.setInitialGridPagination
              : () => {};
    const { dynamicListView, listLoading } = useSelector(
        (state) => state?.dynamicListReducer ?? dynamicListInitialState,
    );
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { tldlUserList } = useSelector(
        (state) => state?.targetListViewReducer ?? targetListInitialState,
    );
    // const utcTimeData = useSelector((state) => getUtcTimeData(state));
    
    // Use UTC time from API if available, otherwise fallback to system time
    // const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);


    const [userList, setUserList] = useState([]);
    const [searchDate, setSearchDate] = useState({});
    const [dates, setDates] = useState({
         startDate: new Date(getDateWithDaynoFormat(AUDIENCE_LIST_LAST_30_DAYS_OFFSET)),
        endDate: new Date(),
        selectedDateText: 'Last 30 days',
    });
    const nameSuggestDebounceRef = useRef(null);
    const nameSuggestGenRef = useRef(0);
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [nameSuggestLoading, setNameSuggestLoading] = useState(false);
    const [searchValueSync, setSearchValueSync] = useState({ rev: 0, value: '' });
    const prevDepartmentId = useRef(departmentId);
    useEffect(() => {
        if (prevDepartmentId.current !== departmentId) {
            prevDepartmentId.current = departmentId;
            setDates({
                 startDate: new Date(getDateWithDaynoFormat(AUDIENCE_LIST_LAST_30_DAYS_OFFSET)),
                 endDate: new Date(),
                selectedDateText: 'Last 30 days',
            });
        }
    }, [departmentId]);

    useEffect(() => {
        return () => {
            if (window.location.pathname !== '/audience') {
                dispatch(target_list_view({ field: 'tldlUserList', data: [] }));
            }
        };
    }, [dispatch]);

    const applyPaginationReset = useCallback(
        (options = {}) => {
            const built = buildAudiencePaginationReset({
                listTypeView,
                pageConfig,
            });
            const pagination = applyAudiencePagination({
                setPagerPageConfig,
                setPageConfig,
                built,
            });
            setInitialGridPagination(options.initialGridPagination ?? false);
            return pagination;
        },
        [listTypeView, pageConfig, setPagerPageConfig, setPageConfig, setInitialGridPagination],
    );

    const applyPaginationPreserve = useCallback(() => {
        const built = buildAudiencePaginationPreserve({
            listTypeView,
            pageConfig,
        });
        applyAudiencePagination({ setPagerPageConfig, setPageConfig, built });
        setInitialGridPagination(false);
    }, [listTypeView, pageConfig, setPagerPageConfig, setPageConfig, setInitialGridPagination]);

    const applyPaginationClearDefaults = useCallback(() => {
        const built = buildAudiencePaginationClearDefaults({ listTypeView });
        const pagination = applyAudiencePagination({
            setPagerPageConfig,
            setPageConfig,
            built,
        });
        setInitialGridPagination(true);
        return pagination;
    }, [listTypeView, setPagerPageConfig, setPageConfig, setInitialGridPagination]);

    const handleDateChange = (pickedDates) => {
        const pagination = applyPaginationReset();
        const searchDates = {
            startDate: getYYMMDD(pickedDates?.startDate),
            endDate: getYYMMDD(pickedDates?.endDate),
        };
        setSearchDate(searchDates);
        setDates((prev) => ({
            ...prev,
            startDate: pickedDates?.startDate ?? prev.startDate,
            endDate: pickedDates?.endDate ?? prev.endDate,
            selectedDateText: pickedDates?.selectedDateText ?? prev.selectedDateText,
        }));
        setisDateFilter(true),
            setParams((prev) => ({
                ...prev,
                pagination,
                isAdvanceSearch: true,
                isFilteration: true,
                filteration: {
                    ...prev.filteration,
                    isDateFilter: true,
                    dateFilter: {
                        fromDate: getYYMMDD(pickedDates.startDate),
                        toDate: getYYMMDD(pickedDates.endDate),
                    },
                },
            }));
    };

    const handleSearchText = (data, meta = {}) => {
        const pagination = applyPaginationReset();
        const isAdvanceSearch =
            data.type === 'List name' ? resolveDynamicIsAdvanceSearch(meta, {}) : true;
        let value;
        if (data?.searchValue) {
            value = data?.type === 'Created by' ? data?.searchValue?.userId ?? data?.text : data?.text;
        } else {
            value = data?.text;
        }
        setisDateFilter(true);
        setParams((prev) => ({
            ...prev,
            pagination,
            isAdvanceSearch,
            isFilteration: true,
            filteration: {
                ...prev.filteration,
                isContains: true,
                isDateFilter: true,
                searchBy: data?.type,
                searchValue: value,
            },
        }));
    };

    const handleApprovalStatus = (approvalStatus) => {
        switch (approvalStatus?.toLowerCase()) {
            case 'pending':
                return 0;
            case 'approved':
                return 1;
            case 'rejected':
                return 2;
            default:
                return '';
        }
    };
 const getStatus = (type) => {
    switch (type) {
        case 'Archived':
            return 'archived';
        case 'Unarchived':
            return 'unarchived';
        case 'Used':
            return 'used';
        case 'Not used':
            return 'notused'; 
        default:
            return '';
    }
};
    const handleAdvanceSearch = (formStateData, meta = {}) => {
        const pagination = applyPaginationReset();
        const isAdvanceSearch = resolveDynamicIsAdvanceSearch(meta, formStateData);
        if (meta?.forceSubmit) {
            clearLastDispatchedDynamicListParams?.();
        }
        setisDateFilter(true);
        setParams((prev) => {
            const fil = { ...prev.filteration };

            if ('list_type' in formStateData && Array.isArray(formStateData.list_type)) {
                if (formStateData.list_type.length === 0) {
                    fil.listType = '';
                } else if (isEntireMultiSelectChosen(DYNAMIC_LIST_TYPE_FILTER_META, formStateData.list_type)) {
                    fil.listType = '';
                } else {
                    const formatted = handleAdvanceSearchDataFormat({ list_type: formStateData.list_type }) || {};
                    fil.listType = formatted.list_type ?? '';
                }
                fil.listName = '';
                fil.searchBy = '';
                fil.isContains = false;
                fil.searchValue = '';
            }
            if ('approval_status' in formStateData && Array.isArray(formStateData.approval_status)) {
                if (formStateData.approval_status.length === 0) {
                    fil.approvalStatus = '';
                } else if (isEntireMultiSelectChosen(AUDIENCE_APPROVAL_STATUS_FILTER_META, formStateData.approval_status)) {
                    fil.approvalStatus = '';
                } else {
                    const mapped = formStateData.approval_status.map((status) => handleApprovalStatus(status));
                    const formatted = handleAdvanceSearchDataFormat({ approval_status: mapped }) || {};
                    fil.approvalStatus = formatted.approval_status ?? '';
                }
            }
            
            if ('status' in formStateData && Array.isArray(formStateData.status)) {
                if (formStateData.status.length === 0) {
                    fil.status = '';
                } else if (isEntireMultiSelectChosen(AUDIENCE_STATUS_FILTER_META, formStateData.status)) {
                    fil.status = '';
                } else {
                    const mapped = formStateData.status.map((status) => getStatus(status));
                    const formatted = handleAdvanceSearchDataFormat({ status: mapped }) || {};
                    fil.status = formatted.status ?? '';
                }
            }
            if ('created_by' in formStateData && Array.isArray(formStateData.created_by)) {
                const createdByFilterMeta = {
                    key: 'created_by',
                    data: userList?.map((list) => list?.firstName).filter(Boolean) || [],
                    isObject: false,
                    fieldKey: 'name',
                };
                if (formStateData.created_by.length === 0) {
                    fil.createdBy = '';
                } else if (isEntireMultiSelectChosen(createdByFilterMeta, formStateData.created_by)) {
                    fil.createdBy = '';
                } else {
                    const ids =
                        userList?.filter((user) => formStateData.created_by.includes(user?.firstName))?.map(
                            (u) => u?.userId,
                        ) || [];
                    const formatted = handleAdvanceSearchDataFormat({ createdBy: ids }) || {};
                    fil.createdBy = formatted.createdBy || '0';
                }
            }
            if ('sort_type' in formStateData) {
                fil.sortBy = Number(formStateData.sort_type) || AUDIENCE_LIST_DEFAULT_SORT_BY_ID;
            }

            if ('communication_name_text' in formStateData) {
                const t = String(formStateData.communication_name_text ?? '').trim();
                if (t) {
                    fil.searchBy = 'List name';
                    fil.searchValue = t;
                    fil.listName = t;
                    fil.isContains = true;
                } else {
                    fil.searchBy = '';
                    fil.searchValue = '';
                    fil.listName = '';
                }
            }

            return {
                ...prev,
                pagination,
                isAdvanceSearch,
                isFilteration: true,
                filteration: fil,
            };
        });
    };

    const handleClearFieldText = (status) => {
        // status = true means closing the search, status = false means clearing all fields
        // When closing (status = true), preserve pagination
        // When clearing all (status = false), reset pagination only if there were active filters
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);

        const {
            isAdvanceSearch,
            filteration: { listName, searchValue },
        } = params;
        
        const hasActiveFilters = isAdvanceSearch || listName || searchValue;
        
        if (!status && hasActiveFilters) {
            const pagination = applyPaginationClearDefaults();
            setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
            setParams((prev) => ({
                ...prev,
                isAdvanceSearch: true,
                pagination,
                filteration: {
                    ...prev.filteration,
                    listName: '',
                    listType: '',
                    createdBy: '',
                    approvalStatus: '',status: '',
                    searchBy: '',
                    isContains: false,
                    searchValue: '',
                    sortBy: AUDIENCE_LIST_DEFAULT_SORT_BY_ID,
                },
            }));
        } else if (status) {
            applyPaginationPreserve();
        }
    };

    const hanldeSearchClearField = (status) => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const {
            isAdvanceSearch,
            filteration: { listName, searchValue },
        } = params;
        
        if (!status && (searchValue || listName)) {
            const pagination = applyPaginationReset();
            setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
            setParams((prev) => ({
                ...prev,
                isAdvanceSearch: true,
                filteration: {
                    ...prev.filteration,
                    listName: '',
                    searchBy: '',
                    isContains: false,
                    searchValue: '',
                },
                pagination,
            }));
        }
    };

    const handleUserList = useCallback(async () => {
        if (tldlUserList && tldlUserList.length > 0) {
            return tldlUserList;
        }
        const payload = {
            clientId,
            departmentId,
            userId,
        };
        try {
            const response = await dispatch(getTLDLUserNameList({ payload, loading: false }));
            return normalizeTLDLUserListRows(response || {});
        } catch (error) {
            return [];
        }
    }, [clientId, departmentId, userId, dispatch, tldlUserList]);

    useEffect(() => {
        const fetchUserList = async () => {
            const data = await handleUserList();
            setUserList(data);
        };
        if (clientId && departmentId) {
            void fetchUserList();
        }
    }, [clientId, departmentId]);

    const advanceFilterConfig = useMemo(
        () =>
            buildAudienceListAdvanceFilterConfig({
                listTypeOptions: DYNAMIC_LIST_TYPE_OPTIONS,
                createdByFirstNames: userList?.map((list) => list?.firstName).filter(Boolean) || [],
            }),
        [userList],
    );

    const fetchDynamicListNameSuggestions = useCallback(
        async (text, armGen) => {
            const trimmed = String(text ?? '').trim();
            if (trimmed.length < LIST_NAME_SUGGEST_MIN_CHARS) {
                nameSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                return;
            }
            if (armGen !== nameSuggestGenRef.current) {
                return;
            }
            setNameSuggestLoading(true);
            const searchPayload = {
                clientId,
                userId,
                departmentId,
                searchText: trimmed,
                searchType: 'List name',
                fromDate: searchDate.startDate ?? getYYMMDD(dates.startDate),
                toDate: searchDate.endDate ?? getYYMMDD(dates.endDate),
            };
            try {
                const response = await dispatch(
                    getSearchDropdownData({ payload: searchPayload, loading: false }),
                );
                if (armGen !== nameSuggestGenRef.current) return;
                if (response?.status && response?.data != null) {
                    const raw = response?.data;
                    let parsed = raw;
                    if (typeof raw === 'string') {
                        parsed = safeParseJSON(raw, []);
                    }
                    setNameSuggestions(Array.isArray(parsed) ? parsed : []);
                } else {
                    setNameSuggestions([]);
                }
            } catch {
                if (armGen !== nameSuggestGenRef.current) return;
                setNameSuggestions([]);
            } finally {
                if (armGen === nameSuggestGenRef.current) {
                    setNameSuggestLoading(false);
                }
            }
        },
        [clientId, departmentId, userId, dispatch, searchDate, dates],
    );

    const handleDynamicSearchChange = (value, selectedSearchType = 'List name') => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        if (selectedSearchType !== 'List name') {
            nameSuggestGenRef.current += 1;
            setNameSuggestions([]);
            setNameSuggestLoading(false);
            return;
        }
        const trimmed = String(value ?? '').trim();
        if (trimmed.length < LIST_NAME_SUGGEST_MIN_CHARS) {
            nameSuggestGenRef.current += 1;
            setNameSuggestions([]);
            setNameSuggestLoading(false);
            return;
        }
        nameSuggestGenRef.current += 1;
        const armGen = nameSuggestGenRef.current;
        setNameSuggestions([]);
        setNameSuggestLoading(true);
        nameSuggestDebounceRef.current = setTimeout(() => {
            nameSuggestDebounceRef.current = null;
            void fetchDynamicListNameSuggestions(trimmed, armGen);
        }, LIST_NAME_SUGGEST_DEBOUNCE_MS);
    };

    const handlePickDynamicListName = (label) => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const text = String(label ?? '').trim();
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: text }));
        handleSearchText({ type: 'List name', text }, { isAdvanceSearch: false });
    };

    const handleSearchExpandedChange = useCallback((expanded) => {
        if (!expanded) {
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
                nameSuggestDebounceRef.current = null;
            }
            nameSuggestGenRef.current += 1;
            setNameSuggestions([]);
            setNameSuggestLoading(false);
        }
    }, []);

    const handleDynamicFiltersChange = (filters, meta = {}) => {
        if (meta?.syncFiltersOnly && filters && typeof filters === 'object') {
            prevAudienceAdvanceFiltersRef.current = filters;
            return;
        }
        if (!filters || Object.keys(filters).length === 0) {
            prevAudienceAdvanceFiltersRef.current = filters || {};
            handleClearFieldText(false);
            return;
        }
        const prev = prevAudienceAdvanceFiltersRef.current;
        prevAudienceAdvanceFiltersRef.current = filters;

        if (meta?.forceSubmit) {
            handleAdvanceSearch(buildDynamicAudienceFormStateFromFilters(filters), meta);
            return;
        }

        const wasRemoved = (key) =>
            prev &&
            typeof prev === 'object' &&
            Object.prototype.hasOwnProperty.call(prev, key) &&
            !Object.prototype.hasOwnProperty.call(filters, key);

        const listNameTrimmed = String(
            filters.communication_name?.rawValue ?? filters.communication_name?.displayValue ?? '',
        ).trim();
        const formState = {
            communication_name_text: listNameTrimmed,
        };
        if (filters.list_type?.rawValue?.length) {
            formState.list_type = filters.list_type.rawValue;
        } else if (wasRemoved('list_type') || (filters.list_type != null && !filters.list_type?.rawValue?.length)) {
            formState.list_type = [];
        }
        if (filters.approval_status?.rawValue?.length) {
            formState.approval_status = filters.approval_status.rawValue;
        } else if (
            wasRemoved('approval_status') ||
            (filters.approval_status != null && !filters.approval_status?.rawValue?.length)
        ) {
            formState.approval_status = [];
        }
        if (filters.status?.rawValue?.length) {
            formState.status = filters.status.rawValue;
        } else if (
            wasRemoved('status') ||
            (filters.status != null && !filters.status?.rawValue?.length)
        ) {
            formState.status = [];
        }
        if (filters.created_by?.rawValue?.length) {
            formState.created_by = filters.created_by.rawValue;
        } else if (wasRemoved('created_by') || (filters.created_by != null && !filters.created_by?.rawValue?.length)) {
            formState.created_by = [];
        }
        if ('sort_type' in filters && filters.sort_type != null) {
            const raw = filters.sort_type.rawValue;
            const sortCandidate =
                raw != null && typeof raw === 'object' ? raw.id ?? raw : raw;
            const sortId = Number(sortCandidate);
            if (Number.isFinite(sortId)) {
                formState.sort_type = sortId;
            }
        }
        handleAdvanceSearch(formState, meta);
    };

    const handleAdvanceCommunicationNameSearchChange = useCallback(
        (value) => {
            const trimmed = String(value ?? '').trim();
            if (nameSuggestDebounceRef.current) {
                clearTimeout(nameSuggestDebounceRef.current);
                nameSuggestDebounceRef.current = null;
            }
            if (trimmed.length < LIST_NAME_SUGGEST_MIN_CHARS) {
                nameSuggestGenRef.current += 1;
                setNameSuggestions([]);
                setNameSuggestLoading(false);
                return;
            }
            nameSuggestGenRef.current += 1;
            const armGen = nameSuggestGenRef.current;
            setNameSuggestions([]);
            setNameSuggestLoading(true);
            nameSuggestDebounceRef.current = setTimeout(() => {
                nameSuggestDebounceRef.current = null;
                void fetchDynamicListNameSuggestions(trimmed, armGen);
            }, LIST_NAME_SUGGEST_DEBOUNCE_MS);
        },
        [fetchDynamicListNameSuggestions],
    );

    const dismissAdvanceCommunicationNameSuggest = useCallback(() => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
    }, []);

    const listHeaderDisabled =
        listLoading || (isAudience === 0 && !dynamicListView?.list?.length);

    const isDynamicListAddDisabled = !addAccess || listLoading;

    const persistAudienceDynamicFiltersKey = useMemo(
        () => buildAdvanceSearchPersistStorageKey('audience-dynamic', clientId, userId, departmentId),
        [clientId, userId, departmentId],
    );

    const prevAudienceAdvanceFiltersRef = useRef(null);

    const supplementalFilterTags = useMemo(() => [], []);

    return (
        <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer">
            <RSAdvanceSearchNew
                key={departmentId}
                disabled={listHeaderDisabled}
                initialActiveFilters={AUDIENCE_DEFAULT_INITIAL_ACTIVE_FILTERS}
                persistActiveFilters
                persistActiveFiltersStorageKey={persistAudienceDynamicFiltersKey}
                excludeActiveFilterTagKeys={COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS}
                searchPlaceholder={`Search ${String(TABLE_LIST_NAME || 'list name').toLowerCase()}`}
                advanceSearchOptions={DYNAMIC_ADVANCE_SEARCH_OPTIONS}
                filterConfig={advanceFilterConfig}
                supplementalFilterTags={supplementalFilterTags}
                lockMainBarWhenFilterChipsPresent
                onAdvanceCommunicationNameSearchChange={handleAdvanceCommunicationNameSearchChange}
                onAdvanceCommunicationNameSuggestDismiss={dismissAdvanceCommunicationNameSuggest}
                onSearch={(value, meta = {}) => {
                    if (nameSuggestDebounceRef.current) {
                        clearTimeout(nameSuggestDebounceRef.current);
                        nameSuggestDebounceRef.current = null;
                    }
                    nameSuggestGenRef.current += 1;
                    setNameSuggestions([]);
                    setNameSuggestLoading(false);
                    const text = String(value || '').trim();
                    if (!text) {
                        if (meta?.skipListNameClearOnEmpty) {
                            return;
                        }
                        const pagination = applyPaginationReset();
                        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
                        setisDateFilter(true);
                        setParams((prev) => ({
                            ...prev,
                            pagination,
                            isAdvanceSearch: meta?.isAdvanceSearch ?? false,
                            isFilteration: true,
                            filteration: {
                                ...prev.filteration,
                                listName: '',
                                searchBy: '',
                                searchValue: '',
                                isContains: false,
                            },
                        }));
                        return;
                    }
                    setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: text }));
                    handleSearchText(
                        {
                            type: meta?.type || 'List name',
                            text,
                            searchValue: meta?.searchValue ?? text,
                        },
                        meta,
                    );
                }}
                onSearchChange={handleDynamicSearchChange}
                onSearchExpandedChange={handleSearchExpandedChange}
                onRefresh={() => hanldeSearchClearField(false)}
                onClear={() => handleClearFieldText(false)}
                onFiltersChange={handleDynamicFiltersChange}
                searchSuggestions={nameSuggestions}
                searchSuggestionsLoading={nameSuggestLoading}
                onSearchSuggestionPick={handlePickDynamicListName}
                searchValueSync={searchValueSync}
                minCharsForSearchSubmit={LIST_NAME_SUGGEST_MIN_CHARS}
                dateRangeComponent={
                    <span className={listHeaderDisabled ? 'pe-none click-off' : ''}>
                        <RSDateRangePicker onDatePickerClosed={(dates) => handleDateChange(dates)} isTemplate />
                    </span>
                }
                createButtonComponent={
                    <span className="d-inline-flex align-items-center rs-asn-audience-actions">
                        <RSTooltip text={!listTypeView ? CARD_VIEW : GRID_VIEW} position="top" className="lh0 mr15">
                            <div className={listHeaderDisabled ? 'pe-none click-off' : ''}>
                                <i
                                    className={`${
                                        listTypeView ? circle_list_edge_large : circle_grid_fill_edge_large
                                    } icon-lg color-primary-blue icon-hover-shadow-primary `}
                                    onClick={() => setListTypeView(!listTypeView)}
                                />
                            </div>
                        </RSTooltip>
                        <RSTooltip text={CREATE_NEW_DYNAMIC_LIST} position="top" className="lh0">
                            <i
                                id="rs_data_circle_plus_fill_edge"
                                className={`${isDynamicListAddDisabled ? 'click-off pe-none ' : ''}${
                                    circle_plus_fill_edge_large
                                } icon-lg color-primary-blue icon-hover-shadow-primary`}
                                onClick={() => {
                                    if (isDynamicListAddDisabled) return;
                                    navigate('/audience/create-dynamic-list', {
                                        state: { mode: 'add' },
                                    });
                                }}
                            />
                        </RSTooltip>
                    </span>
                }
            />
        </div>
    );
};

export default DynamicHeaderView;
