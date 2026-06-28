import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

export const SKELETON_SHIMMER_VARIANT = {
    BOX: 'box',
    CIRCLE: 'circle',
    PILL: 'pill',
    LINE: 'line',
};

const DEFAULT_HEIGHT = 24;
const DEFAULT_BORDER_RADIUS = 4;

const SKELETON_SHIMMER_DEFAULT_STYLE = {
    backgroundColor: '#e2e7ee',
    display: 'block',
    boxSizing: 'border-box',
    borderRadius: DEFAULT_BORDER_RADIUS,
};

const toCssSize = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return typeof value === 'number' ? `${value}px` : value;
};

const getVariantDimensions = (variant, { width, height, borderRadius, size }) => {
    const resolvedWidth = size ?? width;
    const resolvedHeight = size ?? height;

    switch (variant) {
        case SKELETON_SHIMMER_VARIANT.CIRCLE:
            return {
                width: toCssSize(resolvedWidth ?? 40),
                height: toCssSize(resolvedHeight ?? resolvedWidth ?? 40),
                borderRadius:
                    borderRadius !== undefined && borderRadius !== null
                        ? toCssSize(borderRadius)
                        : '50%',
            };
        case SKELETON_SHIMMER_VARIANT.PILL: {
            const pillHeight = resolvedHeight ?? DEFAULT_HEIGHT;
            const pillRadius =
                borderRadius !== undefined && borderRadius !== null
                    ? toCssSize(borderRadius)
                    : typeof pillHeight === 'number'
                      ? `${pillHeight / 2}px`
                      : '9999px';

            return {
                width: toCssSize(resolvedWidth ?? 80),
                height: toCssSize(pillHeight),
                borderRadius: pillRadius,
            };
        }
        case SKELETON_SHIMMER_VARIANT.LINE:
            return {
                width: toCssSize(resolvedWidth ?? '100%'),
                height: toCssSize(resolvedHeight ?? DEFAULT_HEIGHT),
                ...(borderRadius !== undefined && borderRadius !== null
                    ? { borderRadius: toCssSize(borderRadius) }
                    : {}),
            };
        case SKELETON_SHIMMER_VARIANT.BOX:
        default:
            return {
                width: toCssSize(resolvedWidth),
                height: toCssSize(resolvedHeight ?? DEFAULT_HEIGHT),
                ...(borderRadius !== undefined && borderRadius !== null
                    ? { borderRadius: toCssSize(borderRadius) }
                    : {}),
            };
    }
};

/**
 * Shared shimmer — layout/spacing via className + critical CSS; size/shape via props.
 */
const SkeletonShimmer = ({
    className = '',
    variant = SKELETON_SHIMMER_VARIANT.BOX,
    width,
    height,
    size,
    borderRadius,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    maxWidth,
    minWidth,
    display = 'block',
    style,
    ...rest
}) => {
    const mergedStyle = useMemo(() => {
        const dimensionStyle = getVariantDimensions(variant, { width, height, borderRadius, size });
        const resolvedStyle = Object.fromEntries(
            Object.entries(dimensionStyle).filter(([, value]) => value !== undefined),
        );

        return {
            flexShrink: 0,
            ...SKELETON_SHIMMER_DEFAULT_STYLE,
            display,
            ...resolvedStyle,
            ...(margin !== undefined ? { margin: toCssSize(margin) } : {}),
            ...(marginTop !== undefined ? { marginTop: toCssSize(marginTop) } : {}),
            ...(marginBottom !== undefined ? { marginBottom: toCssSize(marginBottom) } : {}),
            ...(marginLeft !== undefined ? { marginLeft: toCssSize(marginLeft) } : {}),
            ...(marginRight !== undefined ? { marginRight: toCssSize(marginRight) } : {}),
            ...(maxWidth !== undefined ? { maxWidth: toCssSize(maxWidth) } : {}),
            ...(minWidth !== undefined ? { minWidth: toCssSize(minWidth) } : {}),
            ...style,
        };
    }, [
        variant,
        width,
        height,
        size,
        borderRadius,
        margin,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        maxWidth,
        minWidth,
        display,
        style,
    ]);

    const variantClass = variant !== SKELETON_SHIMMER_VARIANT.BOX ? `skeleton-shimmer--${variant}` : '';

    return (
        <span
            className={`skeleton-shimmer ${variantClass} ${className}`.trim()}
            style={mergedStyle}
            aria-hidden="true"
            {...rest}
        />
    );
};

SkeletonShimmer.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(Object.values(SKELETON_SHIMMER_VARIANT)),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    margin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    marginTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    marginBottom: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    marginLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    marginRight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    display: PropTypes.string,
    style: PropTypes.object,
};

export default memo(SkeletonShimmer);
