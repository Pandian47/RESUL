import { truncateTitle } from 'Utils/modules/displayCore';
/**
 * ResKendoGrid - TruncateCell
 *
 * Smart text truncation with tooltip on overflow.
 * Ported from RSKendoGrid/TruncateCell.jsx
 */
import { Children, memo, useLayoutEffect, useRef, useState } from 'react';
import { GridColumnMenuWrapper } from '@progress/kendo-react-grid';
import { IconWrap } from '@progress/kendo-react-common';
import { sortAscSmallIcon, sortDescSmallIcon } from '@progress/kendo-svg-icons';
import RSTooltip from 'Components/RSTooltip';


const HEADER_TITLE_TRUNCATE_STYLE = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
    minWidth: 0,
};

const isElementTextTruncated = (el) => {
    if (!el) return false;
    if (el.scrollWidth > el.clientWidth + 1) return true;

    const parent = el.parentElement;
    if (parent && el.scrollWidth > parent.clientWidth + 1) return true;

    const availableWidth = (parent || el).clientWidth;
    const label = el.textContent?.trim();
    if (availableWidth <= 0 || !label) return false;

    const style = window.getComputedStyle(el);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;

    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return context.measureText(label).width > availableWidth + 1;
};

const useOverflowTruncation = (displayValue, forceTooltip = false) => {
    const textRef = useRef(null);
    const [isOverflowTruncated, setIsOverflowTruncated] = useState(false);

    const checkTruncation = () => {
        const el = textRef.current;
        if (!el) return;

        const truncated = isElementTextTruncated(el);
        setIsOverflowTruncated((prev) => (prev !== truncated ? truncated : prev));
    };

    useLayoutEffect(() => {
        let resizeObserver;
        let layoutTimer;

        const setup = () => {
            checkTruncation();
            const el = textRef.current;
            if (!el || resizeObserver || typeof ResizeObserver === 'undefined') {
                return;
            }
            resizeObserver = new ResizeObserver(checkTruncation);
            resizeObserver.observe(el);
            if (el.parentElement) {
                resizeObserver.observe(el.parentElement);
            }
        };

        const raf = requestAnimationFrame(setup);
        layoutTimer = window.setTimeout(checkTruncation, 150);
        window.addEventListener('resize', checkTruncation);

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(layoutTimer);
            window.removeEventListener('resize', checkTruncation);
            resizeObserver?.disconnect();
        };
    }, [displayValue]);

    return {
        textRef,
        showTooltip: forceTooltip || isOverflowTruncated,
    };
};

export const TruncatedHeaderTitle = ({
    displayText = '',
    tooltipText,
    forceTooltip = false,
    className = '',
    tooltipPosition = 'top',
}) => {
    const fullTooltip = tooltipText ?? displayText;
    const { textRef, showTooltip } = useOverflowTruncation(displayText, forceTooltip);

    const textElement = (
        <span
            ref={textRef}
            style={{ ...HEADER_TITLE_TRUNCATE_STYLE, width: '100%' }}
            className={className}
        >
            {displayText}
        </span>
    );

    return (
        <RSTooltip
            text={fullTooltip}
            position={tooltipPosition}
            innerContent={false}
            tooltipOverlayClass="toolTipOverlayZindexCSS"
            wrapperTag="span"
            className="rs-kendo-header-title-tooltip"
            trigger={showTooltip ? ['hover', 'focus'] : []}
        >
            {textElement}
        </RSTooltip>
    );
};

const renderHeaderSortIcons = (field, sort, sortable) => {
    if (!sortable || !Array.isArray(sort) || sort.length === 0) {
        return null;
    }

    const sortIndex = sort.findIndex((entry) => entry.field === field);
    if (sortIndex < 0) {
        return null;
    }

    const sortEntry = sort[sortIndex];

    return (
        <>
            <span className="k-sort-icon">
                <IconWrap
                    name={`sort-${sortEntry.dir}-small`}
                    icon={sortEntry.dir === 'asc' ? sortAscSmallIcon : sortDescSmallIcon}
                />
            </span>
            {sort.length > 1 && (
                <span className="k-sort-icon">
                    <span className="k-sort-order">{sortIndex + 1}</span>
                </span>
            )}
        </>
    );
};

const HEADER_FILTER_ICON_SELECTOR =
    '.k-i-more-vertical, .k-svg-i-more-vertical, .k-grid-header-menu .k-button-icon, .k-grid-header-menu .k-svg-icon';

const KENDO_NON_DOM_CELL_PROPS = new Set(['columnId']);

/** Kendo Grid v15 passes camelCase ARIA keys; React DOM expects kebab-case aria-* attributes. */
const CAMEL_ARIA_TO_DOM = {
    ariaHasPopup: 'aria-haspopup',
    ariaExpanded: 'aria-expanded',
    ariaControls: 'aria-controls',
    ariaLabel: 'aria-label',
    ariaLabelledBy: 'aria-labelledby',
    ariaDescribedBy: 'aria-describedby',
    ariaDescription: 'aria-description',
    ariaSort: 'aria-sort',
    ariaColIndex: 'aria-colindex',
    ariaRowIndex: 'aria-rowindex',
    ariaSelected: 'aria-selected',
    ariaDisabled: 'aria-disabled',
    ariaHidden: 'aria-hidden',
    ariaReadOnly: 'aria-readonly',
    ariaChecked: 'aria-checked',
    ariaPressed: 'aria-pressed',
    ariaCurrent: 'aria-current',
    ariaLive: 'aria-live',
    ariaAtomic: 'aria-atomic',
    ariaBusy: 'aria-busy',
    ariaRelevant: 'aria-relevant',
    ariaModal: 'aria-modal',
    ariaMultiLine: 'aria-multiline',
    ariaMultiSelectable: 'aria-multiselectable',
    ariaOrientation: 'aria-orientation',
    ariaPlaceholder: 'aria-placeholder',
    ariaPosInSet: 'aria-posinset',
    ariaSetSize: 'aria-setsize',
    ariaValueMax: 'aria-valuemax',
    ariaValueMin: 'aria-valuemin',
    ariaValueNow: 'aria-valuenow',
    ariaValueText: 'aria-valuetext',
};

/** Kendo Grid v15 adds non-DOM keys to th/td props — strip or normalize before spreading onto table cells. */
export const getGridCellDomProps = (cellProps = {}) => {
    if (!cellProps || typeof cellProps !== 'object') return {};

    const domProps = {};

    Object.entries(cellProps).forEach(([key, value]) => {
        if (KENDO_NON_DOM_CELL_PROPS.has(key)) return;

        const ariaDomKey = CAMEL_ARIA_TO_DOM[key];
        if (ariaDomKey) {
            domProps[ariaDomKey] = value;
            return;
        }

        // Drop unmapped camelCase aria* keys to avoid invalid DOM attribute warnings.
        if (key.startsWith('aria') && key.length > 4 && /[A-Z]/.test(key.slice(4))) {
            return;
        }

        domProps[key] = value;
    });

    return domProps;
};

const applyHeaderFilterIconClasses = (rootEl) => {
    if (!rootEl) return;

    rootEl.querySelectorAll(HEADER_FILTER_ICON_SELECTOR).forEach((element) => {
        element.classList.remove('k-icon');
        element.classList.add('icon-rs-filter-mini', 'icon-xs');
    });
};

export const TruncatedGridHeaderCell = ({
    thProps,
    title = '',
    titleLength,
    isActiveColumn = false,
    showColumnMenu = false,
    onClick,
    columnMenuWrapperProps,
    children: gridChildren,
}) => {
    const fullTitle = title || '';
    const displayTitle = titleLength ? truncateTitle(fullTitle, titleLength) : fullTitle;
    const isCharTruncated = Boolean(titleLength && displayTitle !== fullTitle);
    const clickProps = onClick ? { onClick } : {};
    const childArray = Children.toArray(gridChildren);
    const resizer = childArray.length > 1 ? childArray[childArray.length - 1] : null;
    const { sort, sortable } = columnMenuWrapperProps || {};
    const field = columnMenuWrapperProps?.column?.field;
    const filterSlotRef = useRef(null);

    useLayoutEffect(() => {
        applyHeaderFilterIconClasses(filterSlotRef.current);
    }, [showColumnMenu, sort, isActiveColumn, field, columnMenuWrapperProps]);

    const { className: thPropsClassName, style: thStyle, ...domThProps } = getGridCellDomProps(thProps);

    return (
        <th
            {...domThProps}
            className={[thPropsClassName, 'res-kendo-custom-header-cell'].filter(Boolean).join(' ')}
            style={thStyle}
        >
            <span className="k-cell-inner rs-kendo-header-cell-inner">
                <span className="k-link rs-kendo-header-link" {...clickProps}>
                    <span className="rs-kendo-header-title-slot">
                        <TruncatedHeaderTitle
                            displayText={displayTitle}
                            tooltipText={fullTitle}
                            forceTooltip={isCharTruncated}
                            className={`k-column-title m0 rs-kendo-columnTitle ${isActiveColumn ? 'bg-alert' : ''}`}
                        />
                    </span>
                    {renderHeaderSortIcons(field, sort, sortable)}
                </span>
                {showColumnMenu && columnMenuWrapperProps && (
                    <span className="rs-kendo-header-filter-slot" ref={filterSlotRef}>
                        <GridColumnMenuWrapper {...columnMenuWrapperProps} />
                    </span>
                )}
            </span>
            {resizer}
        </th>
    );
};

const formatCellValue = (value) => {
    if (value == null) return 'NA';
    if (typeof value === 'number' && Number.isNaN(value)) return 'NA';
    return String(value);
};

const TruncatedCell = ({
    value = '',
    alignRight = false,
    noTable = false,
    tooltipPosition = 'top',
    tooltipText,
    /** Kendo Grid passes td props (includes column `className`) — required for alignment/styling */
    tdProps,
    className: cellClassName,
}) => {
    const displayValue = formatCellValue(value);
    const displayTooltip =
        tooltipText !== undefined && tooltipText !== null ? tooltipText : displayValue;
    const { textRef, showTooltip: isTruncated } = useOverflowTruncation(displayValue);

    const textElement = (
        <span ref={textRef} style={{ ...HEADER_TITLE_TRUNCATE_STYLE, width: '100%' }} className="k-text-truncate">
            {displayValue}
        </span>
    );

    const content = isTruncated ? (
        <RSTooltip
            text={displayTooltip}
            position={tooltipPosition}
            innerContent={false}
            tooltipOverlayClass="toolTipOverlayZindexCSS"
            wrapperTag="span"
        >
            {textElement}
        </RSTooltip>
    ) : (
        textElement
    );

    if (noTable) {
        return (
            <span
                className="k-truncate-cell-inline"
                style={{ display: 'block', minWidth: 0, width: '100%' }}
            >
                {content}
            </span>
        );
    }

    const { className: tdPropsClassName, style: tdStyle, ...restTdProps } = getGridCellDomProps(tdProps);
    const mergedClassName = [tdPropsClassName, cellClassName, alignRight ? 'text-right' : '']
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
        <td {...restTdProps} className={mergedClassName} style={{ minWidth: 0, ...(tdStyle || {}) }}>
            {content}
        </td>
    );
};

export default memo(TruncatedCell);
