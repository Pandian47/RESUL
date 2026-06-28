import AppListDetail from './Component/AppListDetail/AppListDetail';
import AppListRowCell from './Component/AppListRowCell/AppListRowCell';

export const MOBILEPUSH_APPLIST_INITIALSTATE = {
    dataResult: null,
    dataState: {
        skip: 0,
        take: 5,
        sort: [
            {
                field: 'orderDate',
                dir: 'desc',
            },
        ],
    },
    appList: [],
    listError: false,
    totalCount: 0,
    PAGERSETTINGS: {
        info: true,
        pageSizes: [5, 10, 20],
        previousNext: true,
        buttonCount: 4,
        className: 'rs-kendo-pager',
    },
};

export const GridDetailComponent = (props, disabled, getData, onCollapse) => {
    return <AppListDetail {...props} disabled={disabled} getData={getData} onCollapse={onCollapse}/>;
};
export const RowDetailComponent = (props, getData,healthCheckData) => {
    return <AppListRowCell {...props} getData={getData} getTenantId={getTenantId} healthCheckData={healthCheckData}/>;
};
