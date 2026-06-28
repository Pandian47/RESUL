import { NO_DATA_AVAILABEL } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
import { gridClass } from './config';

const SKELETON_BASE = '#e2e7ee';

const SkelLine = ({ width = '100%', height = 15, className = '', animated = true }) => (
    <span
        className={`${gridClass('detail-skel-line')} ${animated ? 'skeleton-shimmer' : gridClass('detail-skel-static')} ${className}`.trim()}
        style={{ width, height, display: 'block' }}
        aria-hidden="true"
    />
);

const SkelChannelIcon = ({ animated = true }) => (
    <span
        className={`${gridClass('detail-skel-channel-icon')} ${animated ? 'skeleton-shimmer' : gridClass('detail-skel-static')}`.trim()}
        style={{
            display: 'inline-block',
            width: 32,
            height: 32,
            minWidth: 32,
            minHeight: 32,
            borderRadius: '50%',
            backgroundColor: animated ? SKELETON_BASE : undefined,
        }}
        aria-hidden="true"
    />
);

const SkelCircle = ({ size = 20, className = '', animated = true }) => (
    <span
        className={`${gridClass('detail-skel-circle')} ${animated ? 'skeleton-shimmer' : gridClass('detail-skel-static')} ${className}`.trim()}
        style={{
            display: 'inline-block',
            width: size,
            height: size,
            minWidth: size,
            minHeight: size,
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: animated ? SKELETON_BASE : undefined,
        }}
        aria-hidden="true"
    />
);

const SkelActionIcons = ({ iconCount = 3, animated = true }) => (
    <ul className={`rs-communication-icon ${gridClass('detail-skel-actions')}`}>
        {Array.from({ length: iconCount }).map((_, index) => (
            <li key={`detail-action-skel-${index}`}>
                <SkelCircle size={22} animated={animated} />
            </li>
        ))}
    </ul>
);

export const getCommunicationDetailColCount = ({
    campaignType,
    isSubsegment = false,
    hasAnyGrouping = false,
    hasSocialChannel = false,
}) => {
    let count = 3;
    if (campaignType === 'M') {
        count += 1;
        if (isSubsegment) count += 1;
    }
    if (hasAnyGrouping) count += 1;
    if (hasSocialChannel) count += 1;
    return count;
};

export const getAnalyticsDetailColCount = ({
    campaignType,
    isSubsegment = false,
    hasAnyGrouping = false,
    hideTotalSent = false,
    hideReachColumn = false,
    hideReachDelivered = false,
}) => {
    let count = 2;
    if (campaignType === 'M') {
        count += 1;
        if (isSubsegment) count += 1;
    }
    if (hasAnyGrouping) count += 1;
    if (!hideTotalSent) count += 1;
    if (!hideReachColumn) count += 1;
    count += 2;
    if (!hideReachDelivered) count += 2;
    count += 1;
    return count;
};

const CommunicationDetailSkeletonRow = ({
    campaignType,
    isSubsegment,
    hasAnyGrouping,
    hasSocialChannel,
    rowIndex,
    animated = true,
}) => {
    const isM = campaignType === 'M';

    return (
        <tr key={`detail-skel-${rowIndex}`} className={gridClass('detail-skeleton-row')} aria-hidden="true">
            {isM && isSubsegment && (
                <td className={gridClass('detail-skel-subsegment')}>
                    <SkelLine width="55%" height={16} animated={animated} />
                </td>
            )}
            <td className={gridClass('detail-skel-channel')}>
                <div className="d-flex">
                    <SkelChannelIcon animated={animated} />
                </div>
            </td>
            {hasAnyGrouping && (
                <td className={gridClass('detail-skel-group')}>
                    <SkelLine width={72} height={18} animated={animated} />
                </td>
            )}
            {isM && (
                <td className={gridClass('detail-skel-friendly')}>
                    <SkelLine width="70%" height={16} animated={animated} />
                </td>
            )}
            <td className={gridClass('detail-skel-status')}>
                <div className={`cl-status-icons ${gridClass('detail-skel-status-lines')}`}>
                    <SkelLine height={15} animated={animated} />
                </div>
            </td>
            {hasSocialChannel && (
                <td className={gridClass('detail-skel-post-type')}>
                    <SkelLine width={72} height={16} animated={animated} />
                </td>
            )}
            <td className={`text-end ${gridClass('detail-skel-action-cell')}`}>
                <SkelActionIcons iconCount={3} animated={animated} />
            </td>
        </tr>
    );
};

const AnalyticsDetailSkeletonRow = ({
    campaignType,
    isSubsegment,
    hasAnyGrouping,
    hideTotalSent,
    hideReachColumn,
    hideReachDelivered,
    rowIndex,
    animated = true,
}) => {
    const isM = campaignType === 'M';

    return (
        <tr key={`analytics-detail-skel-${rowIndex}`} className={gridClass('detail-skeleton-row')} aria-hidden="true">
            {isM && isSubsegment && (
                <td className={gridClass('detail-skel-subsegment')}>
                    <SkelLine width="55%" height={16} animated={animated} />
                </td>
            )}
            <td className={gridClass('detail-skel-channel')}>
                <div className="d-flex">
                    <SkelChannelIcon animated={animated} />
                </div>
            </td>
            {hasAnyGrouping && (
                <td className={gridClass('detail-skel-group')}>
                    <SkelLine width={72} height={18} animated={animated} />
                </td>
            )}
            {isM && (
                <td className={gridClass('detail-skel-friendly')}>
                    <SkelLine width="70%" height={16} animated={animated} />
                </td>
            )}
            <td className={gridClass('detail-skel-status')}>
                <div className={`cl-status-icons ${gridClass('detail-skel-status-lines')}`}>
                    <SkelLine height={15} animated={animated} />
                </div>
            </td>
            {!hideTotalSent && (
                <td className={`text-end rs-cl-col-metrics ${gridClass('detail-skel-metrics')}`}>
                    <SkelLine height={15} animated={animated} />
                </td>
            )}
            {!hideReachColumn && (
                <td className={`text-end rs-cl-col-metrics ${gridClass('detail-skel-metrics')}`}>
                    <SkelLine height={15} animated={animated} />
                </td>
            )}
            <td className={`text-end rs-cl-col-metrics ${gridClass('detail-skel-metrics')}`}>
                <SkelLine height={15} animated={animated} />
            </td>
            <td className={`text-end rs-cl-col-metrics ${gridClass('detail-skel-metrics')}`}>
                <SkelLine height={15} animated={animated} />
            </td>
            {!hideReachDelivered && (
                <>
                    <td className={`text-end rs-cl-col-metrics ${gridClass('detail-skel-metrics')}`}>
                        <SkelLine height={15} animated={animated} />
                    </td>
                    <td className={`text-end rs-cl-col-metrics ${gridClass('detail-skel-metrics')}`}>
                        <SkelLine height={15} animated={animated} />
                    </td>
                </>
            )}
            <td className={`text-end ${gridClass('detail-skel-action-cell')}`}>
                <SkelActionIcons iconCount={2} animated={animated} />
            </td>
        </tr>
    );
};

export const ListDetailSkeletonRows = ({
    variant = 'communication',
    campaignType,
    isSubsegment = false,
    hasAnyGrouping = false,
    hasSocialChannel = false,
    hideTotalSent = false,
    hideReachColumn = false,
    hideReachDelivered = false,
    rowCount = 2,
    animated = true,
}) =>
    Array.from({ length: rowCount }, (_, rowIndex) =>
        variant === 'analytics' ? (
            <AnalyticsDetailSkeletonRow
                key={`analytics-detail-skel-${rowIndex}`}
                campaignType={campaignType}
                isSubsegment={isSubsegment}
                hasAnyGrouping={hasAnyGrouping}
                hideTotalSent={hideTotalSent}
                hideReachColumn={hideReachColumn}
                hideReachDelivered={hideReachDelivered}
                rowIndex={rowIndex}
                animated={animated}
            />
        ) : (
            <CommunicationDetailSkeletonRow
                key={`detail-skel-${rowIndex}`}
                campaignType={campaignType}
                isSubsegment={isSubsegment}
                hasAnyGrouping={hasAnyGrouping}
                hasSocialChannel={hasSocialChannel}
                rowIndex={rowIndex}
                animated={animated}
            />
        ),
    );

export const ListDetailEmptyMessage = () => (
    <div className={gridClass('detail-nodata')}>
        <i
            className={`${alert_medium} icon-md color-primary-orange mr5 cursor-default`}
            aria-hidden="true"
        />
        <span>{NO_DATA_AVAILABEL}</span>
    </div>
);

export const ListDetailEmptyOverlay = () => (
    <div className={gridClass('detail-empty-overlay')} role="status" aria-live="polite">
        <ListDetailEmptyMessage />
    </div>
);

export const ListDetailEmptyRow = ({ colSpan }) => (
    <tr className={gridClass('detail-empty-row')}>
        <td colSpan={colSpan} className={gridClass('detail-empty-cell')}>
            <ListDetailEmptyMessage />
        </td>
    </tr>
);

export const CommunicationListDetailSkeletonRows = (props) => (
    <ListDetailSkeletonRows variant="communication" {...props} />
);

export const AnalyticsListDetailSkeletonRows = (props) => (
    <ListDetailSkeletonRows variant="analytics" {...props} />
);

export const CommunicationListDetailEmptyRow = ListDetailEmptyRow;
export const AnalyticsListDetailEmptyRow = ListDetailEmptyRow;
export const CommunicationListDetailEmptyOverlay = ListDetailEmptyOverlay;
export const AnalyticsListDetailEmptyOverlay = ListDetailEmptyOverlay;

ListDetailSkeletonRows.propTypes = {
    variant: PropTypes.oneOf(['communication', 'analytics']),
    campaignType: PropTypes.string,
    isSubsegment: PropTypes.bool,
    hasAnyGrouping: PropTypes.bool,
    hasSocialChannel: PropTypes.bool,
    hideTotalSent: PropTypes.bool,
    hideReachColumn: PropTypes.bool,
    hideReachDelivered: PropTypes.bool,
    rowCount: PropTypes.number,
    animated: PropTypes.bool,
};

ListDetailEmptyRow.propTypes = {
    colSpan: PropTypes.number.isRequired,
};
