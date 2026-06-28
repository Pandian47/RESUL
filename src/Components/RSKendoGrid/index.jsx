/**
 * RSKendoGrid — legacy wrapper
 *
 * Delegates all rendering to ResKendoGrid with variant="default".
 * Maintains the original prop surface (column, sortable=true, etc.) so
 * existing call-sites require zero changes.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';

const RSKendoGrid = ({
    data,
    filterMenuData = null,
    column = [],
    settings,
    scrollable = 'none',
    pageable = true,
    isListTable = true,
    noBoxShadow = false,
    isDataStateRequired = false,
    onDataStateChange = () => {},
    // isFailure / isFailureMessage — empty-state message when API returns no rows
    isFailure,
    isFailureMessage,
    change,
    config,
    flag = false,
    pagerChange = false,
    sortable = true,
    isFullData = false,
    callbackFilterChange = () => {},
    initialFilter = null,
    appliedFilter = undefined,
    filterable = false,
    isScrollTop = true,
    setInitialPagination = () => {},
    customSettingsClassName = '',
    className = '',
    isCustomClass = '',
    isLoading = false,
    hasLoaded,
    loadResetKey,
    skeletonColumns,
    skeletonRows,
    onPageSizeChange = () => {},
    autoResizeSize = false,
    isConsumption = false,
    hidePaginationInfo = false,
    hideFirstLastNav = false,
    noDataText = '',
    noDataShowIcon = true,
}) => (
    <ResKendoGrid
        variant="default"
        data={data}
        columns={column}
        settings={settings}
        scrollable={scrollable}
        pageable={pageable}
                sortable={sortable}
        filterable={filterable}
        isListTable={isListTable}
        noBoxShadow={noBoxShadow}
        isDataStateRequired={isDataStateRequired}
        onDataStateChange={onDataStateChange}
        change={change}
        config={config}
        flag={flag}
        pagerChange={pagerChange}
        isFullData={isFullData}
        callbackFilterChange={callbackFilterChange}
        initialFilter={initialFilter}
        isScrollTop={isScrollTop}
        setInitialPagination={setInitialPagination}
        customSettingsClassName={customSettingsClassName || className}
        isCustomClass={isCustomClass}
        isLoading={isLoading}
        hasLoaded={hasLoaded}
        loadResetKey={loadResetKey}
        skeletonColumns={skeletonColumns}
        skeletonRows={skeletonRows}
        onPageSizeChange={onPageSizeChange}
        autoResizeSize={autoResizeSize}
                            isConsumption={isConsumption}
        hidePaginationInfo={hidePaginationInfo}
        hideFirstLastNav={hideFirstLastNav}
        noDataText={noDataText || (isFailure && isFailureMessage) || ''}
        noDataShowIcon={noDataShowIcon}
    />
);

RSKendoGrid.propTypes = {
    data: PropTypes.array.isRequired,
    filterMenuData: PropTypes.array,
    column: PropTypes.array,
    settings: PropTypes.object,
    scrollable: PropTypes.string,
    pageable: PropTypes.bool,
    isListTable: PropTypes.bool,
    noBoxShadow: PropTypes.bool,
    isDataStateRequired: PropTypes.bool,
    onDataStateChange: PropTypes.func,
    isFailure: PropTypes.bool,
    isFailureMessage: PropTypes.string,
    change: PropTypes.func,
    config: PropTypes.object,
    flag: PropTypes.bool,
    pagerChange: PropTypes.bool,
    sortable: PropTypes.bool,
    isFullData: PropTypes.bool,
    callbackFilterChange: PropTypes.func,
    initialFilter: PropTypes.object,
    filterable: PropTypes.bool,
    isScrollTop: PropTypes.bool,
    setInitialPagination: PropTypes.func,
    customSettingsClassName: PropTypes.string,
    className: PropTypes.string,
    isCustomClass: PropTypes.string,
    isLoading: PropTypes.bool,
    hasLoaded: PropTypes.bool,
    loadResetKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    skeletonColumns: PropTypes.number,
    skeletonRows: PropTypes.number,
    onPageSizeChange: PropTypes.func,
    autoResizeSize: PropTypes.bool,
    isConsumption: PropTypes.bool,
    hidePaginationInfo: PropTypes.bool,
    hideFirstLastNav: PropTypes.bool,
    noDataText: PropTypes.node,
    noDataShowIcon: PropTypes.bool,
};

export default memo(RSKendoGrid);
