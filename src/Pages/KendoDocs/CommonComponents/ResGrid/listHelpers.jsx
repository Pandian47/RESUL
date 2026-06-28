import ListRowCell from './ListRowCell';
import ListDetailCell from './ListDetailCell';

export { default as ListEntityImage } from './ListEntityImage';

/** Default list layout column using built-in ListRowCell. */
export const getDefaultListColumns = () => [
    { cell: (props) => <ListRowCell {...props} /> },
];

/** List columns with a custom row cell (e.g. AnalyticsList, AppListRowCell). */
export const createListColumns = (RowCellComponent) => [
    { cell: (props) => <RowCellComponent {...props} /> },
];

/** Default detail renderer for list layout demos. */
export const createListDetailRenderer = (onCollapse) => (props) => (
    <ListDetailCell {...props} onCollapse={onCollapse} />
);

export default {
    getDefaultListColumns,
    createListColumns,
    createListDetailRenderer,
};
