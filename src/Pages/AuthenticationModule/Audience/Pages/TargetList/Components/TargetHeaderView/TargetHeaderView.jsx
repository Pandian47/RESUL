import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { handleAdvanceSearchDataFormat } from 'Utils/modules/navigation';
import { getCsvListType } from 'Utils/modules/browserUtils';
import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { safeParseJSON } from 'Utils/modules/stringUtils';

import { CARD_VIEW, GRID_VIEW, TABLE_LIST_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_grid_fill_edge_large, circle_list_edge_large, circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSAdvanceSearchNew, {
    buildAdvanceSearchPersistStorageKey,
    isEntireMultiSelectChosen,
} from 'Components/AdvanceSearchNew';

import { TargetListContext } from '../..';

import { LISTS, getListType, getApprovalStatus, CreateList, getStatus } from './constant';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { useDispatch, useSelector } from 'react-redux';
import {
    AUDIENCE_APPROVAL_STATUS_OPTIONS,
    AUDIENCE_DEFAULT_INITIAL_ACTIVE_FILTERS,
    AUDIENCE_STATUS_OPTIONS,
    COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS,
    buildAudienceListAdvanceFilterConfig,
} from '../../../../audienceAdvanceSearchDefaults';
import { AUDIENCE_LIST_DEFAULT_SORT_BY_ID } from '../../../../audienceModuleDefaults';
import { getSessionId } from 'Reducers/globalState/selector';
import { AUDIENCE_LIST_LAST_30_DAYS_OFFSET } from '../../../../audienceModuleDefaults';
import { getSearchDropdownDataTargetList, getTLDLUserNameList, normalizeTLDLUserListRows } from 'Reducers/audience/targetList/request';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import {
    applyAudiencePagination,
    buildAudiencePaginationClearDefaults,
    buildAudiencePaginationPreserve,
    buildAudiencePaginationReset,
} from '../../../DynamicList/constant';
import { target_list_view } from 'Reducers/audience/targetList/reducer';

/** Debounced TargetlistSearchName calls only; list view loads on Enter / search / suggestion pick. */
const LIST_NAME_SUGGEST_DEBOUNCE_MS = 400;
const LIST_NAME_SUGGEST_MIN_CHARS = 3;
const TARGET_ADVANCE_SEARCH_OPTIONS = ['List name', 'List type', 'Created by'];

const TARGET_LIST_TYPE_FILTER_META = {
    key: 'list_type',
    data: LISTS,
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
const TargetHeaderView = ({ targetListViewLen }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { tldlUserList, targetListView, totalListCount, listLoading } = useSelector(
        (state) => state.targetListViewReducer,
    );
    // const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const { isAudience } = getUserDetails();
    
    // Use UTC time from API if available, otherwise fallback to system time
    // const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);


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
    const [userList, setUserList] = useState([]);
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
    const {
        listTypeView,
        setListTypeView,
        setParams,
        lists,
        isDateFilter,
        params,
        setisDateFilter,
        setPagerPageConfig,
        setInitialGridPagination,
        setPageConfig,
        pageConfig,
    } = useContext(TargetListContext);

    const applyPaginationReset = useCallback(
        (options = {}) => {
            const built = buildAudiencePaginationReset({
                listTypeView,
                pageConfig,
                viewLen: targetListViewLen,
            });
            const pagination = applyAudiencePagination({
                setPagerPageConfig,
                setPageConfig,
                built,
            });
            setInitialGridPagination(options.initialGridPagination ?? false);
            return pagination;
        },
        [listTypeView, pageConfig, targetListViewLen, setPagerPageConfig, setPageConfig, setInitialGridPagination],
    );

    const applyPaginationPreserve = useCallback(() => {
        const built = buildAudiencePaginationPreserve({
            listTypeView,
            pageConfig,
            viewLen: targetListViewLen,
        });
        applyAudiencePagination({ setPagerPageConfig, setPageConfig, built });
        setInitialGridPagination(false);
    }, [listTypeView, pageConfig, targetListViewLen, setPagerPageConfig, setPageConfig, setInitialGridPagination]);

    const applyPaginationClearDefaults = useCallback(() => {
        const built = buildAudiencePaginationClearDefaults({
            listTypeView,
            viewLen: targetListViewLen,
        });
        const pagination = applyAudiencePagination({
            setPagerPageConfig,
            setPageConfig,
            built,
        });
        setInitialGridPagination(true);
        return pagination;
    }, [listTypeView, targetListViewLen, setPagerPageConfig, setPageConfig, setInitialGridPagination]);

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

    const handleAdvanceSearch = (data) => {
        const pagination = applyPaginationReset();
        setisDateFilter(true);
        setParams((prev) => {
            const fil = { ...prev.filteration };

            if ('list_type' in data && Array.isArray(data.list_type)) {
                if (data.list_type.length === 0) {
                    fil.listType = '';
                } else if (isEntireMultiSelectChosen(TARGET_LIST_TYPE_FILTER_META, data.list_type)) {
                    fil.listType = '';
                } else {
                    const mapped = data.list_type.map((type) => (type === 'My list' ? userId : getListType(type)));
                    const formatted = handleAdvanceSearchDataFormat({ list_type: mapped }) || {};
                    fil.listType = formatted.list_type ?? '';
                }
                fil.listName = '';
                fil.searchBy = '';
                fil.isContains = false;
                fil.searchValue = '';
            }
            if ('approval_status' in data && Array.isArray(data.approval_status)) {
                if (data.approval_status.length === 0) {
                    fil.approvalStatus = '';
                } else if (isEntireMultiSelectChosen(AUDIENCE_APPROVAL_STATUS_FILTER_META, data.approval_status)) {
                    fil.approvalStatus = '';
                } else {
                    const mapped = data.approval_status.map((status) => getApprovalStatus(status));
                    const formatted = handleAdvanceSearchDataFormat({ approval_status: mapped }) || {};
                    fil.approvalStatus = formatted.approval_status ?? '';
                }
            }            
            if ('status' in data && Array.isArray(data.status)) {
                if (data.status.length === 0) {
                    fil.status = '';
                } else if (isEntireMultiSelectChosen(AUDIENCE_STATUS_FILTER_META, data.status)) {
                    fil.status = '';
                } else {
                    const mapped =  data.status.map((status) => getStatus(status));
                    const formatted = handleAdvanceSearchDataFormat({ status: mapped }) || {};
                    fil.status = formatted.status ?? '';
                }
            }
            if ('created_by' in data && Array.isArray(data.created_by)) {
                const createdByFilterMeta = {
                    key: 'created_by',
                    data: userList?.map((list) => list?.firstName).filter(Boolean) || [],
                    isObject: false,
                    fieldKey: 'name',
                };
                if (data.created_by.length === 0) {
                    fil.createdBy = '';
                } else if (isEntireMultiSelectChosen(createdByFilterMeta, data.created_by)) {
                    fil.createdBy = '';
                } else {
                    const ids =
                        userList?.filter((user) => data.created_by.includes(user?.firstName))?.map((u) => u?.userId) ||
                        [];
                    const formatted = handleAdvanceSearchDataFormat({ created_by: ids }) || {};
                    fil.createdBy = formatted.created_by || '0';
                }
            }
            if ('sort_type' in data) {
                fil.sortBy = Number(data.sort_type) || AUDIENCE_LIST_DEFAULT_SORT_BY_ID;
            }

            if ('communication_name_text' in data) {
                const t = String(data.communication_name_text ?? '').trim();
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
                isAdvanceSearch: true,status:'',
                isFilteration: true,
                filteration: fil,
            };
        });
    };

    const handleSearchText = (data) => {
        const pagination = applyPaginationReset();
        if (data.type === 'List type') {
            if (['All list', 'My list'].includes(data.text)) {
                if (data?.text === 'All list') {
                    hanldeSelectFilterType(0);
                } else {
                    hanldeSelectFilterType(userId);
                }
            } else {
                hanldeSelectFilterType(getCsvListType(data.text));
            }
        } else if (data.type === 'List name' && data.text !== '') {
            setisDateFilter(true);
            setParams((prev) => ({
                ...prev,
                pagination,
                isAdvanceSearch: true, 
                isFilteration: true,
                filteration: {
                    ...prev.filteration,
                    isContains: true,
                    isDateFilter: true,
                    searchBy: data.type,
                    searchValue: data.text,
                },
            }));
        } else if (data.type === 'Created by' && data.searchValue !== '') {
            setParams((prev) => ({
                ...prev,
                pagination,
                isAdvanceSearch: true, 
                isFilteration: true,
                filteration: {
                    ...prev.filteration,
                    isContains: true,
                    isDateFilter: true,
                    listName: '',
                    searchBy: data.type,
                    searchValue: data.text,
                },
            }));
        } else {
            setParams((prev) => ({
                ...prev,
                pagination,
                isAdvanceSearch: true, 
                isFilteration: true,
                filteration: {
                    ...prev.filteration,
                    isContains: true,
                    isDateFilter: true,
                    searchBy: data.type,
                    searchValue: data.text,
                },
            }));
        }
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
            filteration: { listName, searchValue, listType },
        } = params;
        
        const hasActiveFilters = isAdvanceSearch || listName || searchValue || listType;
        
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
                    approvalStatus: '',
                    searchBy: '',
                    isContains: false,
                    searchValue: '',
                    sortBy: AUDIENCE_LIST_DEFAULT_SORT_BY_ID,
                    status:'',
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
            filteration: { listName, searchValue, listType },
        } = params;
        
        if (!status && (searchValue || listType)) {
            const pagination = applyPaginationReset();
            setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
            setParams((prev) => ({
                ...prev,
                filteration: {
                    ...prev.filteration,
                    listType: '',
                    searchBy: '',
                    isContains: false,
                    searchValue: '',
                },
                pagination,
            }));
            setisDateFilter(false);
        }
    };

    const hanldeSelectFilterType = (status) => {
        const pagination = applyPaginationReset();
        setisDateFilter(true);
        setParams((prev) => ({
            ...prev,
            pagination,
            filteration: {
                ...prev.filteration,
                listType: status === '' || status === null || status === undefined ? '' : String(status),
                listName: '',
                searchBy: '',
                searchValue: '',
            },
        }));
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
                listTypeOptions: LISTS,
                createdByFirstNames: userList?.map((list) => list?.firstName).filter(Boolean) || [],
            }),
        [userList],
    );

    const fetchTargetListNameSuggestions = useCallback(
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
                    getSearchDropdownDataTargetList({ payload: searchPayload, loading: false }),
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

    const handleTargetSearchChange = (value, selectedSearchType = 'List name') => {
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
            void fetchTargetListNameSuggestions(trimmed, armGen);
        }, LIST_NAME_SUGGEST_DEBOUNCE_MS);
    };

    const handlePickTargetListName = (label) => {
        if (nameSuggestDebounceRef.current) {
            clearTimeout(nameSuggestDebounceRef.current);
            nameSuggestDebounceRef.current = null;
        }
        nameSuggestGenRef.current += 1;
        setNameSuggestions([]);
        setNameSuggestLoading(false);
        const text = String(label ?? '').trim();
        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: text }));
        handleSearchText({ type: 'List name', text });
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

    const handleAudienceFiltersChange = (filters, meta = {}) => {
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
        handleAdvanceSearch(formState);
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
                void fetchTargetListNameSuggestions(trimmed, armGen);
            }, LIST_NAME_SUGGEST_DEBOUNCE_MS);
        },
        [fetchTargetListNameSuggestions],
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
        listLoading ||
        (isAudience === 0 && !totalListCount && !targetListView?.length);

    const isTargetListAddDisabled = !addAccess || listLoading || isAudience === 0;

    const persistAudienceTargetFiltersKey = useMemo(
        () => buildAdvanceSearchPersistStorageKey('audience-target', clientId, userId, departmentId),
        [clientId, userId, departmentId],
    );

    /** Detect multiselect keys removed from `activeFilters` so we still clear API `filteration` (chip remove). */
    const prevAudienceAdvanceFiltersRef = useRef(null);

    const supplementalFilterTags = useMemo(() => [], []);

    return (
        <div className="flex-row justify-content-end top-sub-heading advanceSearchContainer">
            <div className="d-none">
                <BootstrapDropdown
                    data={LISTS}
                    alignRight
                    defaultItem="My list"
                    onSelect={(type) => {
                        if (['All list', 'My list'].includes(type)) {
                            if (type === 'All list') {
                                hanldeSelectFilterType(0);
                            } else {
                                hanldeSelectFilterType(userId);
                            }
                        } else {
                            hanldeSelectFilterType(getCsvListType(type));
                        }
                    }}
                />
            </div>
            <RSAdvanceSearchNew
                key={departmentId}
                disabled={listHeaderDisabled}
                initialActiveFilters={AUDIENCE_DEFAULT_INITIAL_ACTIVE_FILTERS}
                persistActiveFilters
                persistActiveFiltersStorageKey={persistAudienceTargetFiltersKey}
                excludeActiveFilterTagKeys={COMMUNICATION_ADVANCE_SEARCH_EXCLUDE_NAME_CHIP_KEYS}
                searchPlaceholder={`Search ${String(TABLE_LIST_NAME || 'list name').toLowerCase()}`}
                advanceSearchOptions={TARGET_ADVANCE_SEARCH_OPTIONS}
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
                    /**
                     * Chip remove / advance sync calls `onSearch('')` before `onFiltersChange`.
                     * Must clear `searchValueSync` and list-name filter fields or the main bar re-fills from the last rev.
                     */
                    if (!text) {
                        const pagination = applyPaginationReset();
                        setSearchValueSync((prev) => ({ rev: prev.rev + 1, value: '' }));
                        setisDateFilter(true);
                        setParams((prev) => ({
                            ...prev,
                            pagination,
                            isAdvanceSearch: true,
                            isFilteration: true,
                            status:'',
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
                    handleSearchText({
                        type: meta?.type || 'List name',
                        text,
                        searchValue: meta?.searchValue ?? text,
                    });
                }}
                onSearchChange={handleTargetSearchChange}
                onSearchExpandedChange={handleSearchExpandedChange}
                onRefresh={() => hanldeSearchClearField(false)}
                onClear={() => handleClearFieldText(false)}
                onFiltersChange={handleAudienceFiltersChange}
                searchSuggestions={nameSuggestions}
                searchSuggestionsLoading={nameSuggestLoading}
                onSearchSuggestionPick={handlePickTargetListName}
                searchValueSync={searchValueSync}
                minCharsForSearchSubmit={LIST_NAME_SUGGEST_MIN_CHARS}
                dateRangeComponent={
                    <span className={listHeaderDisabled ? 'pe-none click-off' : ''}>
                        <RSDateRangePicker onDatePickerClosed={(date) => handleDateChange(date)} isTemplate />
                    </span>
                }
                createButtonComponent={
                    <span className="d-inline-flex align-items-center rs-asn-audience-actions rs-asn-audience-actions-target-list">
                        <RSTooltip
                            text={!listTypeView ? CARD_VIEW : GRID_VIEW}
                            position="top"
                            className="lh0 mr15"
                        >
                            <div className={`${listHeaderDisabled ? 'pe-none click-off' : ''}`}>
                                <i
                                    id="rs_TargetHeaderView_edge"
                                    className={`${
                                        listTypeView ? circle_list_edge_large : circle_grid_fill_edge_large
                                    } icon-lg color-primary-blue icon-hover-shadow-primary`}
                                    onClick={() => setListTypeView(!listTypeView)}
                                />
                            </div>
                        </RSTooltip>
                        <RSBootstrapdown
                            data={CreateList}
                            flatIcon
                            alignRight
                            defaultItem={{
                                name: (
                                    <i
                                        className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                        id="rs_data_circle_plus_fill_edge"
                                    />
                                ),
                                type: 'Create new target list',
                            }}
                            showUpdate={false}
                            isObject
                            fieldKey="name"
                            onSelect={(value) => {
                                if (isTargetListAddDisabled) return;
                                const selectedItem = CreateList.find((item) => item.type === value.type);
                                if (selectedItem && selectedItem?.isQuery) {
                                    const encodedData = encodeUrl(selectedItem?.queryState);
                                    navigate(`${selectedItem.link}?q=${encodedData}`, selectedItem?.queryState);
                                } else if (selectedItem) {
                                    navigate(selectedItem.link, selectedItem?.queryState);
                                }
                            }}
                            className={`${isTargetListAddDisabled ? 'pe-none click-off ' : ''} no_caret`}
                        />
                    </span>
                }
            />
        </div>
    );
};

export default TargetHeaderView;
