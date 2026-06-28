import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { LAYOUT_CLASSES } from '../config';

/**
 * ResListCard — Config-driven card component for ResGrid list layouts.
 *
 * Supports two variants that map to the two card CSS patterns used across the platform:
 *
 *   'communication'  →  rs-communication-list + communication-content sections
 *                       Used by: Communication Listing, Analytics Listing, Offer Management Brands
 *
 *   'app'            →  rs-list-grid-wrapper + rslgw-content sections
 *                       Used by: Mobile App Notification Grid
 *
 * All optional slots (badge, meta, avatar, indicator, title, tags, status) are hidden
 * automatically when not provided or when their render() returns null/undefined.
 *
 * Usage — Communication card:
 *   const config = {
 *     variant: 'communication',
 *     cardModifiers: 'comm-listing',
 *     getStatusClass: (item) => getStatus(item.statusId).className,
 *     badge:  { render: (item) => item.encodeCampaignId },
 *     meta:   { render: (item) => `Created by: ${item.createdBy}, on: ${item.date}` },
 *     title:  { render: (item) => <TruncatedCell value={item.campaignName} noTable /> },
 *     tags:   { render: (item) => renderCommunicationListingTags({ tags: item.tags, ... }) },
 *     columns: [
 *       { key: 'type', label: null, render: (item) => <><small>{item.campaignTypeValue}</small>...</> },
 *       { key: 'audience', label: 'Total Audience', align: 'end', render: (item) => <p>{item.total}</p> },
 *     ],
 *     status: {
 *       getClass: (item) => getStatus(item.statusId).className,
 *       getLabel: (item) => getStatus(item.statusId).status,
 *     },
 *     renderActions: (item) => [
 *       <li key="edit"><i className="icon-rs-pencil-edit-medium icon-md color-primary-blue" /></li>,
 *       ...
 *     ],
 *     expandable: true,
 *   };
 *
 *   <ResListCard dataItem={rowItem} config={config} />
 *
 * Usage — App notification card:
 *   const config = {
 *     variant: 'app',
 *     columns: [
 *       { key: 'appName',    label: 'App name',    render: (item) => <p>{item.appName}</p> },
 *       { key: 'createdBy',  label: 'Created by',  render: (item) => <p>{item.createdBy}</p> },
 *       { key: 'createdDate',label: 'Created date', render: (item) => <p>{item.createdDate}</p> },
 *       { key: 'sdkStatus',  label: 'SDK status',   render: (item) => <p>{item.isEnabled}</p> },
 *     ],
 *     renderActions: (item) => [
 *       <li key="edit">...</li>,
 *       ...
 *     ],
 *     expandable: true,
 *   };
 *
 * Prop: standalone={true}  — renders the wrapper as <div> instead of <td>.
 *                             Use this outside a Kendo Grid (e.g. preview pages, storybook).
 */
const ResListCard = ({
    dataItem = {},
    config = {},
    onExpandClick,
    standalone = false,
}) => {
    const {
        variant = 'communication',
        cardModifiers = '',
        getStatusClass,
        badge,
        avatar,
        meta,
        indicator,
        title,
        tags,
        columns = [],
        status,
        renderActions,
        expandable = true,
    } = config;

    const isExpanded = Boolean(dataItem?.expanded);
    const cardStatusClass = getStatusClass ? getStatusClass(dataItem) : '';

    const handleExpandClick = useCallback(
        (e) => {
            if (onExpandClick) {
                onExpandClick(e, dataItem);
                return;
            }
            const tr = e.currentTarget.closest('tr');
            if (!tr) return;
            const target = tr.querySelector(
                '.k-hierarchy-cell .k-icon-button, .k-hierarchy-cell a, .k-hierarchy-cell button, .k-hierarchy-cell .k-icon',
            );
            target?.click?.();
        },
        [dataItem, onExpandClick],
    );

    const badgeNode     = badge?.render?.(dataItem);
    const avatarNode    = avatar?.render?.(dataItem);
    const metaNode      = meta?.render?.(dataItem);
    const indicatorNode = indicator?.render?.(dataItem);
    const titleNode     = title?.render?.(dataItem);
    const tagsNode      = tags?.render?.(dataItem);
    const actionItems   = renderActions?.(dataItem);

    const Wrapper = standalone ? 'div' : 'td';

    // -----------------------------------------------------------------------
    // App variant  (rs-list-grid-wrapper + rslgw-content)
    // -----------------------------------------------------------------------
    if (variant === 'app') {
        return (
            <Wrapper>
                <div
                    className={[
                        'rs-list-grid-wrapper',
                        cardStatusClass,
                        isExpanded ? 'sp-grid-expanded' : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {columns.map((col, i) => {
                        const content = col.render(dataItem);
                        return (
                            <div key={col.key || i} className="rslgw-content">
                                {col.label != null && <small>{col.label}</small>}
                                {content}
                            </div>
                        );
                    })}

                    {actionItems?.length > 0 && (
                        <div className="rslgw-content">
                            <ul className="rs-list-inline rli-space-15 d-flex grid-view-icons">
                                {actionItems}
                            </ul>
                        </div>
                    )}

                    {expandable && !isExpanded && (
                        <div
                            className={`${cardStatusClass} expand-plus`.trim()}
                            onClick={handleExpandClick}
                            role="button"
                            aria-label="Expand row"
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        >
                            <ul className="rs-icon-panel">
                                <li>
                                    <i className="k-icon k-i-plus" style={{ pointerEvents: 'auto' }} />
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </Wrapper>
        );
    }

    // -----------------------------------------------------------------------
    // Communication variant  (rs-communication-list + communication-content)
    // -----------------------------------------------------------------------
    const hasFirstSection =
        avatarNode || badgeNode || metaNode || indicatorNode || titleNode || tagsNode;

    const statusBadgeClass = status?.getClass?.(dataItem);
    const statusBadgeLabel = status?.getLabel?.(dataItem);
    const showLastSection  = statusBadgeLabel || actionItems?.length > 0;

    const cardClasses = [
        'rs-communication-list',
        cardStatusClass,
        cardModifiers,
        isExpanded ? 'sp-grid-expanded' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Wrapper>
            <div className={cardClasses}>
                {/* ── First section: main info (badge / meta / avatar / indicator / title / tags) ── */}
                {hasFirstSection && (
                    <div className="communication-content">
                        {avatarNode ? (
                            /* Brand-style: avatar image sits beside badge + name */
                            <div
                                className={[
                                    'd-flex align-items-center',
                                    cardModifiers?.includes('brand-shops-card') ? 'resgrid-brand-title-row' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {avatarNode}
                                <div>
                                    {badgeNode && <span className="badge">{badgeNode}</span>}
                                    {titleNode && <p className={LAYOUT_CLASSES.listCardTitle}>{titleNode}</p>}
                                </div>
                            </div>
                        ) : (
                            /* Campaign-style: badge → meta → indicator+title → tags */
                            <>
                                {badgeNode && <span className="badge">{badgeNode}</span>}
                                {metaNode && <small>{metaNode}</small>}
                                {(indicatorNode || titleNode) && (
                                    <div className={`${LAYOUT_CLASSES.listCardTitle} d-flex gap-2 align-items-center`}>
                                        {indicatorNode}
                                        {titleNode}
                                    </div>
                                )}
                                {tagsNode}
                            </>
                        )}
                    </div>
                )}

                {/* ── Middle data columns ── */}
                {columns.map((col, i) => (
                    <div
                        key={col.key || i}
                        className={[
                            'communication-content',
                            col.align === 'end' ? 'text-end' : '',
                            col.className || '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {col.label != null && <small>{col.label}</small>}
                        {col.render(dataItem)}
                    </div>
                ))}

                {/* ── Last section: status badge + action icons ── */}
                {showLastSection && (
                    <div className="communication-content">
                        {statusBadgeLabel && (
                            <div className={`${statusBadgeClass || ''} communication-status`}>
                                <small>{statusBadgeLabel}</small>
                            </div>
                        )}
                        {actionItems?.length > 0 && (
                            <ul className="rs-communication-icon">
                                {actionItems}
                            </ul>
                        )}
                    </div>
                )}

                {/* ── Expand corner button ── */}
                {expandable && (
                    <div
                        className={`${cardStatusClass} expand-plus ${isExpanded ? 'd-none pe-none' : ''}`}
                        onClick={handleExpandClick}
                        role="button"
                        aria-label="Expand row"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                        <ul className="camp-icon-pannel">
                            <li className={isExpanded ? 'pe-none' : ''}>
                                <i className="k-icon k-i-plus" style={{ pointerEvents: 'auto' }} />
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </Wrapper>
    );
};

ResListCard.propTypes = {
    dataItem: PropTypes.object,
    config: PropTypes.shape({
        /** Card HTML variant. Determines wrapper + section CSS classes. */
        variant: PropTypes.oneOf(['communication', 'app']),

        /** Extra CSS classes appended to the card wrapper (e.g. 'comm-listing', 'brand-shops-card'). */
        cardModifiers: PropTypes.string,

        /** Returns the status CSS class applied to the card border accent and expand button. */
        getStatusClass: PropTypes.func,

        // ── First-section slots (communication variant only) ──────────────
        /** Badge chip — rendered inside <span className="badge">. Return null to hide. */
        badge: PropTypes.shape({ render: PropTypes.func }),

        /** Avatar/logo — when present, card adopts brand layout (image beside badge+name). */
        avatar: PropTypes.shape({ render: PropTypes.func }),

        /** Subtitle line — rendered inside <small>. Return null to hide. */
        meta: PropTypes.shape({ render: PropTypes.func }),

        /** Inline indicator before title (e.g. golden-campaign star). Return null to hide. */
        indicator: PropTypes.shape({ render: PropTypes.func }),

        /** Main title. Return null to hide. */
        title: PropTypes.shape({ render: PropTypes.func }),

        /** Tags row rendered below title. Return null to hide. */
        tags: PropTypes.shape({ render: PropTypes.func }),

        // ── Middle columns ────────────────────────────────────────────────
        /**
         * Data columns rendered between the first section and the actions section.
         * Each column always renders its div (even with no content) to maintain
         * CSS nth-child width targeting. Pass an empty array if not needed.
         */
        columns: PropTypes.arrayOf(
            PropTypes.shape({
                key:       PropTypes.string,
                /** Column header label rendered inside <small>. null/undefined = no label shown. */
                label:     PropTypes.string,
                /** Render function — receives dataItem, returns ReactNode. */
                render:    PropTypes.func.isRequired,
                /** 'end' adds text-end class for right-aligned content (e.g. numeric totals). */
                align:     PropTypes.oneOf(['start', 'end']),
                /** Extra CSS class on the section wrapper div. */
                className: PropTypes.string,
            }),
        ),

        // ── Last section ──────────────────────────────────────────────────
        /**
         * Status badge rendered above the action icons.
         * { getClass(item) → CSS class, getLabel(item) → display text }
         * Omit entirely to hide the status badge.
         */
        status: PropTypes.shape({
            getClass: PropTypes.func,
            getLabel: PropTypes.func,
        }),

        /**
         * Action icons/dropdowns rendered inside the actions <ul>.
         * Returns an array of <li> elements.
         * communication variant → placed in rs-communication-icon ul
         * app variant           → placed in rs-list-inline ul
         */
        renderActions: PropTypes.func,

        /** Show the expand corner button. Default: true. */
        expandable: PropTypes.bool,
    }),
    /** Custom expand click handler. Receives (event, dataItem). */
    onExpandClick: PropTypes.func,
    /** Render wrapper as <div> instead of <td>. Use outside Kendo Grid (preview, storybook). */
    standalone: PropTypes.bool,
};

export default memo(ResListCard);
