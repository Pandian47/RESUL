import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import {
    AUDIENCE_LIST_DEFAULT_SORT_BY_ID,
    AUDIENCE_LIST_LAST_30_DAYS_OFFSET,
} from '../../audienceModuleDefaults';
import { getDynamicListFooterData } from '../../audienceFooterLabels';
export const PAGE_CONFIG = {
    skip: 0,
    take: 9,
    responsive: true,
    info: true,
    pageSizes: [6, 9, 12, 18, 36],
    previousNext: true,
    buttonCount: 4,
};

export const ListGridPageConfig = {
    listPageNo: 1,
    listSize: 9,
    gridPageNo: 1,
    gridSize: 3,
};

export const PAGE_CONFIG_GRID = {
    skip: 0,
    take: 5,
    responsive: true,
    info: true,
    pageSizes: [5, 10, 20, 50],
    previousNext: true,
    buttonCount: 4,
};
/** Lazy factory — avoids evaluating date helpers at module load (prod bundle TDZ). */
export function getInitialAudienceSearchPayload() {
    return {
        isFilteration: false,
        filteration: {
            listName: '',
            listType: '',
            createdBy: '',
            approvalStatus: '',
            status: '',
            searchBy: '',
            searchValue: '',
            isContains: false,
            isDateFilter: false,
            sortBy: AUDIENCE_LIST_DEFAULT_SORT_BY_ID,
            dateFilter: {
                fromDate: getYYMMDD(getDateWithDaynoFormat(AUDIENCE_LIST_LAST_30_DAYS_OFFSET)),
                toDate: getYYMMDD(new Date()),
            },
        },
        isAdvanceSearch: true,
    };
}
export const getAudienceFooterData = getDynamicListFooterData;
export const DDL_AUDIENCE_FOOTER_DATA = getDynamicListFooterData(false);

const DEFAULT_LIST_PAGE_SIZE = 9;
const DEFAULT_GRID_PAGE_SIZE = 3;

export function buildAudiencePagerPageConfig({ skip, take }) {
    return { ...PAGE_CONFIG, skip, take };
}

export function buildAudiencePaginationReset({
    listTypeView,
    pageConfig = {},
    viewLen,
    defaultListSize = DEFAULT_LIST_PAGE_SIZE,
    defaultGridSize = DEFAULT_GRID_PAGE_SIZE,
}) {
    const listSizeFallback = viewLen ?? defaultListSize;
    const gridSizeFallback = viewLen ?? defaultGridSize;
    const currentPageSize = listTypeView
        ? pageConfig?.listSize || listSizeFallback
        : pageConfig?.gridSize || gridSizeFallback;

    return {
        pagerPageConfig: buildAudiencePagerPageConfig({ skip: 0, take: currentPageSize }),
        pageConfig: {
            listPageNo: 1,
            listSize: listTypeView ? currentPageSize : pageConfig?.listSize || listSizeFallback,
            gridPageNo: 1,
            gridSize: !listTypeView ? currentPageSize : pageConfig?.gridSize || gridSizeFallback,
        },
        pagination: {
            pageNo: 1,
            pageSize: currentPageSize,
        },
    };
}

export function buildAudiencePaginationPreserve({
    listTypeView,
    pageConfig = {},
    viewLen,
    defaultListSize = DEFAULT_LIST_PAGE_SIZE,
    defaultGridSize = DEFAULT_GRID_PAGE_SIZE,
}) {
    const listSizeFallback = viewLen ?? defaultListSize;
    const gridSizeFallback = viewLen ?? defaultGridSize;
    const currentPageNo = listTypeView ? pageConfig?.listPageNo || 1 : pageConfig?.gridPageNo || 1;
    const currentPageSize = listTypeView
        ? pageConfig?.listSize || listSizeFallback
        : pageConfig?.gridSize || gridSizeFallback;
    const currentSkip = (currentPageNo - 1) * currentPageSize;

    return {
        pagerPageConfig: buildAudiencePagerPageConfig({ skip: currentSkip, take: currentPageSize }),
        pageConfig: {
            listPageNo: listTypeView ? currentPageNo : pageConfig?.listPageNo || 1,
            listSize: listTypeView ? currentPageSize : pageConfig?.listSize || listSizeFallback,
            gridPageNo: !listTypeView ? currentPageNo : pageConfig?.gridPageNo || 1,
            gridSize: !listTypeView ? currentPageSize : pageConfig?.gridSize || gridSizeFallback,
        },
    };
}

export function buildAudiencePaginationClearDefaults({
    listTypeView,
    viewLen,
    defaultListSize = DEFAULT_LIST_PAGE_SIZE,
    defaultGridSize = DEFAULT_GRID_PAGE_SIZE,
}) {
    const listSize = viewLen ?? defaultListSize;
    const gridSize = viewLen ?? defaultGridSize;
    const take = viewLen ?? (listTypeView ? defaultListSize : defaultGridSize);

    return {
        pagerPageConfig: buildAudiencePagerPageConfig({ skip: 0, take }),
        pageConfig: {
            listPageNo: 1,
            listSize,
            gridPageNo: 1,
            gridSize,
        },
        pagination: {
            pageNo: 1,
            pageSize: take,
        },
    };
}

export function applyAudiencePagination({ setPagerPageConfig, setPageConfig, built }) {
    setPagerPageConfig(built.pagerPageConfig);
    setPageConfig(built.pageConfig);
    return built.pagination;
}
