import { useMemo } from 'react';
import {
    GridColumnMenuFilter,
    GridColumnMenuCheckboxFilter,
    GridColumnMenuSort,
} from '@progress/kendo-react-grid';
import { isCompositeFilterDescriptor } from '@progress/kendo-data-query';
import { GRID_CONFIG, LAYOUT_CLASSES } from './config';

const rootFilterOrDefault = (filter) => filter || { filters: [], logic: 'and' };

const filterGroupByField = (field, filter) =>
    rootFilterOrDefault(filter).filters.filter((f) =>
        isCompositeFilterDescriptor(f)
            ? f.filters?.length && !f.filters.find((g) => isCompositeFilterDescriptor(g) || g.field !== field)
            : false,
    )[0] || null;

export const isColumnMenuFilterActive = (field, filter) => !!filterGroupByField(field, filter);

export const isColumnMenuSortActive = (field, sort) => {
    if (!sort?.length) return false;
    const index = sort.findIndex((s) => s.field === field);
    return index > -1 && (sort[index].dir === 'asc' || sort[index].dir === 'desc');
};

export const isColumnActive = (field, dataState) =>
    isColumnMenuFilterActive(field, dataState?.filter) ||
    isColumnMenuSortActive(field, dataState?.sort);

export const ColumnMenu = (props) => (
    <div className={`${LAYOUT_CLASSES.filterMenu} ${GRID_CONFIG.filterPopupClassName}`}>
        <GridColumnMenuSort {...props} />
        <GridColumnMenuFilter {...props} expanded />
    </div>
);

export const ColumnMenuCheckboxFilter = (props, data) => {
    const fieldName = props?.field;

    const sanitizedData = useMemo(() => {
        if (!Array.isArray(data)) return data;
        return data.filter((item) => {
            if (item == null) return false;
            if (!fieldName) return true;
            const value = item?.[fieldName];
            if (value == null) return false;
            if (typeof value === 'string') return value.trim() !== '';
            return true;
        });
    }, [data, fieldName]);

    return (
        <div className={`${LAYOUT_CLASSES.filterMenu} ${GRID_CONFIG.filterPopupClassName}`}>
            <GridColumnMenuCheckboxFilter {...props} data={sanitizedData} expanded />
        </div>
    );
};
