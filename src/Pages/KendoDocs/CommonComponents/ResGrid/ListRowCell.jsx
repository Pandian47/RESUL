import { memo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import RSTooltip from 'Components/RSTooltip';
import { LAYOUT_CLASSES } from './config';
import { resolveListStatusClass } from './utils';

/**
 * Generic list-row cell for ResGrid card layout.
 * Renders the resgrid-communication-list card structure.
 *
 * dataItem shape:
 *  - code: string (badge text)
 *  - meta: string (subtitle text)
 *  - title: string (main title)
 *  - tags: string (comma-separated tags)
 *  - dimension: string (campaign type)
 *  - category: string (category name)
 *  - sentOn: string (date)
 *  - statusLabel: string (status text; mapped via listLayout.statusClassMap)
 *  - statusClassName: string (optional — overrides map)
 *  - statusID: number (optional — uses getStatus when no label match)
 *  - expanded: boolean
 */
const ListRowCell = ({ dataItem, tdProps, onToggleExpand, listLayout }) => {
    const statusClass = resolveListStatusClass(dataItem, listLayout);
    const isExpanded = Boolean(dataItem?.expanded);

    useEffect(() => {
        const hierarchyCells = document.querySelectorAll('.k-hierarchy-cell a[href]');
        hierarchyCells.forEach((anchor) => {
            anchor.setAttribute('aria-hidden', 'true');
            anchor.style.opacity = '0';
        });
    }, [isExpanded]);

    const handleExpandClick = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (onToggleExpand) {
                onToggleExpand(dataItem);
                return;
            }

            const tr = e.currentTarget.closest('tr');
            if (!tr) return;
            const expandTarget = tr.querySelector('.k-hierarchy-cell a[href]');
            expandTarget?.click();
        },
        [dataItem, onToggleExpand],
    );

    const title = dataItem?.title ?? '';

    const { style: tdStyle, className: tdClassName, ...restTdProps } = tdProps || {};
    const platformCardClasses = listLayout?.cardClassNames?.trim() || '';

    return (
        <td
            {...restTdProps}
            className={tdClassName}
            style={{ width: '100%', padding: 0, border: 0, minWidth: 0, ...tdStyle }}
        >
            <div
                className={[
                    LAYOUT_CLASSES.communicationList,
                    platformCardClasses,
                    statusClass,
                    isExpanded ? 'sp-grid-expanded' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div className="communication-content">
                    <div className={LAYOUT_CLASSES.listCardMeta}>
                        <span className="badge">{dataItem?.code}</span>
                        {dataItem?.meta ? (
                            <small className={LAYOUT_CLASSES.listCardMetaText}>{dataItem.meta}</small>
                        ) : null}
                    </div>
                    <div className={LAYOUT_CLASSES.listCardTitle}>
                        {title.length > 60 ? (
                            <RSTooltip text={title} position="bottom" className="d-inline-block">
                                <span>{`${title.slice(0, 60)}...`}</span>
                            </RSTooltip>
                        ) : (
                            title
                        )}
                    </div>
                    {dataItem?.tags && (
                        <small className={LAYOUT_CLASSES.listTags}>
                            <i className="icon-rs-communication-arrow-mini icon-xs" aria-hidden="true" />
                            {dataItem.tags}
                        </small>
                    )}
                </div>
                <div className="communication-content">
                    <small>{dataItem?.dimension}</small>
                    <p>{dataItem?.category}</p>
                </div>
                <div className="communication-content">
                    <small>Sent on</small>
                    <p>{dataItem?.sentOn}</p>
                </div>
                <div className="communication-content">
                    <div className={`${statusClass} communication-status`}>
                        <small>{dataItem?.statusLabel}</small>
                    </div>
                    <ul className={LAYOUT_CLASSES.communicationIcon}>
                        <li>
                            <i className="icon-rs-analytics-medium icon-md color-primary-blue" aria-hidden="true" />
                        </li>
                        <li>
                            <i className="icon-rs-trend-report-large icon-md color-primary-blue" aria-hidden="true" />
                        </li>
                        <li>
                            <i className="icon-rs-share-tick-medium icon-md color-primary-blue" aria-hidden="true" />
                        </li>
                        <li>
                            <i className="icon-rs-download-medium icon-md color-primary-blue" aria-hidden="true" />
                        </li>
                    </ul>
                </div>

                <div
                    className={`${statusClass} expand-plus ${isExpanded ? 'd-none' : ''}`}
                    onClick={handleExpandClick}
                    role="button"
                    aria-label="Expand row"
                    style={{ pointerEvents: 'auto' }}
                >
                    <ul className="camp-icon-pannel">
                        <li>
                            <i className="k-icon k-i-plus" style={{ pointerEvents: 'auto' }} />
                        </li>
                    </ul>
                </div>
            </div>
        </td>
    );
};

ListRowCell.propTypes = {
    dataItem: PropTypes.object,
    tdProps: PropTypes.object,
    onToggleExpand: PropTypes.func,
    listLayout: PropTypes.object,
};

export default memo(ListRowCell);
