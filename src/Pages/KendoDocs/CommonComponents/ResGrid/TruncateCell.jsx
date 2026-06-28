import { memo, useEffect, useRef, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import { formatCellValue } from './utils';

const TruncateCell = ({
    value = '',
    alignRight = false,
    tooltipPosition = 'top',
    tooltipText,
    tdProps,
    className: cellClassName,
}) => {
    const displayValue = formatCellValue(value);
    const displayTooltip =
        tooltipText !== undefined && tooltipText !== null ? tooltipText : displayValue;
    const textRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const checkTruncation = () => {
        const el = textRef.current;
        if (!el) return;
        const truncated = el.scrollWidth > el.clientWidth;
        setIsTruncated((prev) => (prev !== truncated ? truncated : prev));
    };

    useEffect(() => {
        const raf = requestAnimationFrame(checkTruncation);
        window.addEventListener('resize', checkTruncation);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', checkTruncation);
        };
    }, [displayValue]);

    const truncateStyle = {
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
        minWidth: 0,
    };

    const textElement = (
        <span ref={textRef} style={truncateStyle} className="k-text-truncate">
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

    const { className: tdPropsClassName, style: tdStyle, ...restTdProps } = tdProps || {};
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

export default memo(TruncateCell);
