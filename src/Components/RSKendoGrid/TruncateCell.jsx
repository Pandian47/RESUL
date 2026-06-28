import { memo, useLayoutEffect, useRef, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';

const formatCellValue = (value) => {
  if (value == null) return 'NA';
  if (typeof value === 'number' && Number.isNaN(value)) return 'NA';
  return String(value);
};

const isElementTextTruncated = (el) => {
  if (!el) return false;
  if (el.scrollWidth > el.clientWidth + 1) return true;

  const parent = el.parentElement;
  if (parent && el.scrollWidth > parent.clientWidth + 1) return true;

  return false;
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
  /** Optional class for the inline wrapper when `noTable` is true */
  wrapperClassName,
  truncateClassName: truncateClassName,
}) => {
  const displayValue = formatCellValue(value);
  const displayTooltip =
    tooltipText !== undefined && tooltipText !== null ? tooltipText : displayValue;
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncation = () => {
    const el = textRef.current;
    if (!el) return;

    const truncated = isElementTextTruncated(el);
    setIsTruncated((prev) => (prev !== truncated ? truncated : prev));
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

  const truncateStyle = {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
    minWidth: 0, // IMPORTANT for flex
  };

  const textElement = (
    <span
      ref={textRef}
      style={truncateStyle}
      className="k-text-truncate"
    >
      {displayValue}
    </span>
  );

  const tooltipProps = {
    text: displayTooltip,
    position: tooltipPosition,
    innerContent: false,
    tooltipOverlayClass: 'toolTipOverlayZindexCSS',
    wrapperTag: 'span',
  };

  // Grid cells: always keep tooltip wrapper to prevent vertical shift on re-render.
  // Inline/noTable: conditional wrapper preserves card/list layouts (e.g. Preferences).
  const content = noTable ? (
    isTruncated ? (
      <RSTooltip {...tooltipProps}>{textElement}</RSTooltip>
    ) : (
      textElement
    )
  ) : (
    <RSTooltip {...tooltipProps} trigger={isTruncated ? ['hover', 'focus'] : []}>
      {textElement}
    </RSTooltip>
  );

  if (noTable) {
    const inlineClassName = [wrapperClassName].filter(Boolean).join(' ');
    return (
      <span className={`k-truncate-cell-inline ${inlineClassName} ${truncateClassName}`} style={{ display: 'block', minWidth: 0, width: '100%' }}>
        {content}
      </span>
    );
  }

  const { className: tdPropsClassName, style: tdStyle, ...restTdProps } = tdProps || {};
  const mergedClassName = [tdPropsClassName, cellClassName, alignRight ? 'text-right' : '']
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <td
      {...restTdProps}
      className={mergedClassName}
      style={{ minWidth: 0, ...(tdStyle || {}) }}
    >
      {content}
    </td>
  );
};

export default memo(TruncatedCell);