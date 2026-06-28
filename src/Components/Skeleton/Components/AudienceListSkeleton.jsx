import { memo } from 'react';
import PropTypes from 'prop-types';

import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import { mdmAudienceListSkeletonCriticalCss } from 'Components/Skeleton/pages/audience/mdm/mdmSkeletonCriticalCss';
import { skeletonBlockStyle } from 'Components/Skeleton/pages/audience/mdm/mdmSkeletonUtils';

const MDM_GRID_ROWS = 5;
const MDM_GRID_COLUMNS = 8;

const AudienceListSkeleton = ({ injectCriticalCss = true }) => (
    <div className="mdm-sk-audience-list-skeleton" aria-hidden="true">
        {injectCriticalCss ? <style>{mdmAudienceListSkeletonCriticalCss}</style> : null}
        <div className="mdm-sk-audience-list-header">
            <div className="mdm-sk-audience-list-title">
                <div
                    className="mdm-sk-block"
                    style={skeletonBlockStyle({ width: 220, height: 28, radius: 5 })}
                />
                <div
                    className="mdm-sk-audience-list-subtitle mdm-sk-block"
                    style={{ ...skeletonBlockStyle({ width: '60%', height: 18 }), maxWidth: '100%' }}
                />
            </div>
            <div className="mdm-sk-audience-list-actions">
                <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 24, height: 24, circle: true })} />
                <div className="mdm-sk-block" style={skeletonBlockStyle({ width: 24, height: 24, circle: true })} />
            </div>
        </div>
        <div className="mdm-sk-audience-list-body">
            <div className="mdm-sk-audience-grid-wrap">
                <div className="reskendogrid">
                    <div className="reskendogrid-table rs-kendo-grid-table grid-loading-state">
                        <div className="k-grid rs-kendo-scrollable-grid grid-loading-state">
                            <div className="k-grid-norecords">
                                <GridLoadingSkeleton
                                    rows={MDM_GRID_ROWS}
                                    columns={MDM_GRID_COLUMNS}
                                    isLoading
                                    wrapperClassName=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

AudienceListSkeleton.propTypes = {
    injectCriticalCss: PropTypes.bool,
};

export default memo(AudienceListSkeleton);
