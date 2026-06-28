import PropTypes from 'prop-types';
import { LAYOUT_CLASSES } from './config';
import { resolveListStatusClass } from './utils';

const formatMetric = (value) =>
    value === null || value === undefined || value === '' ? 'N/A' : value;

/**
 * Detail panel for expanded list rows — renders channel metrics table.
 * Used with ResGrid layout="list" as the `detail` prop.
 *
 * dataItem.channels shape:
 *  - iconClass: string (channel icon CSS class)
 *  - statusIcon: string (status icon CSS class)
 *  - totalSent, delivered, reach, engagement, conversion: string | number
 */
const ListDetailCell = ({ dataItem, onCollapse, listLayout }) => {
    const channels = dataItem?.channels || [];
    const statusClass = resolveListStatusClass(dataItem, listLayout);

    return (
        <div className={`${LAYOUT_CLASSES.detailView} rs-grid-detail-view ${statusClass}`}>
            <table
                className={`grid-detail-content grid-listing-comm ${LAYOUT_CLASSES.detailContent} ${LAYOUT_CLASSES.detailListing}`}
            >
                <thead>
                    <tr>
                        <th className="rs-cl-col-channel">Channel</th>
                        <th className="rs-cl-col-status">Status</th>
                        <th className="text-end rs-cl-col-metrics">Total sent</th>
                        <th className="text-end rs-cl-col-metrics">Delivered</th>
                        <th className="text-end rs-cl-col-metrics">Reach</th>
                        <th className="text-end rs-cl-col-metrics">Engagement</th>
                        <th className="text-end rs-cl-col-metrics">Conversion</th>
                        <th className="text-end rs-cl-col-action">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {channels.map((channel, index) => (
                        <tr key={`${channel.name || index}-${index}`}>
                            <td className={`${LAYOUT_CLASSES.colChannel} rs-cl-col-channel`}>
                                <div
                                    className={`${LAYOUT_CLASSES.channelIcon} cl-channel-icons`}
                                    style={channel.channelBg ? { backgroundColor: channel.channelBg } : undefined}
                                >
                                    <i className={`${channel.iconClass} icon-md`} aria-hidden="true" />
                                </div>
                            </td>
                            <td className={`${LAYOUT_CLASSES.colStatus} rs-cl-col-status text-center`}>
                                <i className={`${channel.statusIcon} icon-md cl-status-icons`} aria-hidden="true" />
                            </td>
                            <td className="text-end rs-cl-col-metrics">{formatMetric(channel.totalSent)}</td>
                            <td className="text-end rs-cl-col-metrics">{formatMetric(channel.delivered)}</td>
                            <td className="text-end rs-cl-col-metrics">{formatMetric(channel.reach)}</td>
                            <td className="text-end rs-cl-col-metrics">{formatMetric(channel.engagement)}</td>
                            <td className="text-end rs-cl-col-metrics">{formatMetric(channel.conversion)}</td>
                            <td className={`${LAYOUT_CLASSES.colAction} rs-cl-col-action`}>
                                <ul className={`${LAYOUT_CLASSES.communicationIcon} rs-communication-icon`}>
                                    <li>
                                        <i className="icon-rs-eye-medium icon-md color-primary-blue" aria-hidden="true" />
                                    </li>
                                    <li>
                                        <i className="icon-rs-analytics-medium icon-md color-primary-blue" aria-hidden="true" />
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className={`${statusClass} expand-plus`}>
                <ul className="camp-icon-pannel">
                    <li>
                        <i
                            className="k-icon k-i-minus cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCollapse?.(dataItem);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onCollapse?.(dataItem);
                                }
                            }}
                            aria-label="Collapse row"
                        />
                    </li>
                </ul>
            </div>
        </div>
    );
};

ListDetailCell.propTypes = {
    dataItem: PropTypes.object,
    onCollapse: PropTypes.func,
    listLayout: PropTypes.object,
};

export default ListDetailCell;
