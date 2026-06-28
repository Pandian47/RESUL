/**
 * RSKendoGridNew ? legacy wrapper
 *
 * Delegates all rendering to ResKendoGrid with variant="grouped".
 * Maintains the original prop surface so existing call-sites require zero changes.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';

const RSKendoGridNew = ({
    data = [],
    isLoading = false,
    isFailure = false,
    groupedColumns = [],
    staticColumns = [],
    pageable = true,
    scrollable = 'scrollable',
    resizable = true,
    reorderable = true,
    groupable = true,
    sortable = true,
    searchable = true,
    isDataStateRequired = false,
    dataState: controlledDataState,
    settings = {},
    onDataStateChange = () => {},
    noDataText = '',
    selectedChannel = 'All channels',
    initialDataState,
    hideGroupingHeader = false,
    pageSizes: customPageSizes,
}) => (
    <ResKendoGrid
        variant="grouped"
        data={data}
        isLoading={isLoading}
        groupedColumns={groupedColumns}
        staticColumns={staticColumns}
        pageable={pageable}
        scrollable={scrollable}
        resizable={resizable}
        reorderable={reorderable}
        groupable={groupable}
        sortable={sortable}
        searchable={searchable}
        isDataStateRequired={isDataStateRequired}
        dataState={controlledDataState}
        settings={settings}
        onDataStateChange={onDataStateChange}
        noDataText={noDataText}
        selectedChannel={selectedChannel}
        initialDataState={initialDataState}
        hideGroupingHeader={hideGroupingHeader}
        pageSizes={customPageSizes}
    />
);

RSKendoGridNew.propTypes = {
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    isFailure: PropTypes.bool,
    groupedColumns: PropTypes.array,
    staticColumns: PropTypes.array,
    pageable: PropTypes.bool,
    scrollable: PropTypes.string,
    resizable: PropTypes.bool,
    reorderable: PropTypes.bool,
    groupable: PropTypes.bool,
    sortable: PropTypes.bool,
    searchable: PropTypes.bool,
    isDataStateRequired: PropTypes.bool,
    dataState: PropTypes.object,
    settings: PropTypes.object,
    onDataStateChange: PropTypes.func,
    noDataText: PropTypes.string,
    selectedChannel: PropTypes.string,
    initialDataState: PropTypes.object,
    hideGroupingHeader: PropTypes.bool,
    pageSizes: PropTypes.array,
};

export default memo(RSKendoGridNew);
