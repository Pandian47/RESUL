/**
 * RSCustomKendoGrid — legacy wrapper
 *
 * Delegates all rendering to ResKendoGrid with variant="custom".
 *
 * Key behaviour carried over from the original implementation:
 *  - Page size is always derived from window height (autoResizeSize=true).
 *  - Supports isTooltip / titleLength per-column for header tooltips.
 *  - Accepts `column` (not `columns`) to remain API-compatible.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResKendoGrid from 'Pages/KendoDocs/CommonComponents/ResKendoGrid';

const RSCustomKendoGrid = ({
    data,
    column = [],
    settings,
    scrollable = 'none',
    pageable = true,
    isListTable = true,
    noBoxShadow = false,
    isDataStateRequired = false,
    onDataStateChange = () => {},
    config,
    change,
    flag = false,
    pagerChange = false,
    sortable = true,
    isFullData = false,
    callbackFilterChange = () => {},
    filterable = false,
    isScrollTop = true,
    setInitialPagination = () => {},
    customSettingsClassName = '',
    className = '',
    isCustomClass = '',
    onPageSizeChange = () => {},
    isLoading = false,
    hasLoaded,
    loadResetKey,
    noDataText = '',
    skeletonColumns,
    hidePaginationInfo = false,
    hideFirstLastNav = false,
    noDataShowIcon = true,
    isConsumption = false,
}) => (
    <ResKendoGrid
        variant="custom"
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
        config={config}
        change={change}
        flag={flag}
        pagerChange={pagerChange}
        isFullData={isFullData}
        callbackFilterChange={callbackFilterChange}
        isScrollTop={isScrollTop}
        setInitialPagination={setInitialPagination}
        customSettingsClassName={customSettingsClassName || className}
        isCustomClass={isCustomClass}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        hasLoaded={hasLoaded}
        loadResetKey={loadResetKey}
        noDataText={noDataText}
        skeletonColumns={skeletonColumns}
        hidePaginationInfo={hidePaginationInfo}
        hideFirstLastNav={hideFirstLastNav}
        noDataShowIcon={noDataShowIcon}
        isConsumption={isConsumption}
        autoResizeSize={true}
    />
);

RSCustomKendoGrid.propTypes = {
    data: PropTypes.array.isRequired,
    column: PropTypes.array,
    settings: PropTypes.object,
    scrollable: PropTypes.string,
    pageable: PropTypes.bool,
    isListTable: PropTypes.bool,
    noBoxShadow: PropTypes.bool,
    isDataStateRequired: PropTypes.bool,
    onDataStateChange: PropTypes.func,
    config: PropTypes.object,
    change: PropTypes.func,
    flag: PropTypes.bool,
    pagerChange: PropTypes.bool,
    sortable: PropTypes.bool,
    isFullData: PropTypes.bool,
    callbackFilterChange: PropTypes.func,
    filterable: PropTypes.bool,
    isScrollTop: PropTypes.bool,
    setInitialPagination: PropTypes.func,
    customSettingsClassName: PropTypes.string,
    className: PropTypes.string,
    isCustomClass: PropTypes.string,
    onPageSizeChange: PropTypes.func,
    isLoading: PropTypes.bool,
    hasLoaded: PropTypes.bool,
    loadResetKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    noDataText: PropTypes.string,
    skeletonColumns: PropTypes.number,
    hidePaginationInfo: PropTypes.bool,
    hideFirstLastNav: PropTypes.bool,
    noDataShowIcon: PropTypes.bool,
    isConsumption: PropTypes.bool,
};

export default memo(RSCustomKendoGrid);
