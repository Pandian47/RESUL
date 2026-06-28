import PropTypes from 'prop-types';
import { BRAND_SHOP_IMAGE_PLACEHOLDER } from './config';

const PLACEHOLDER_PATH_FRAGMENT = 'image-placeholder';

/** Real uploaded URLs only — empty, SVG demo placeholders, and broken paths use the JPG fallback. */
const hasValidImageSrc = (src) => {
    if (src == null) return false;
    if (typeof src !== 'string') return false;
    const trimmed = src.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('data:image/svg')) return false;
    return true;
};

const resolveImageSrc = (src) => (hasValidImageSrc(src) ? src.trim() : BRAND_SHOP_IMAGE_PLACEHOLDER);

const isPlaceholderImageSrc = (src) =>
    typeof src === 'string' && src.includes(PLACEHOLDER_PATH_FRAGMENT);
/**
 * Brand or shop logo with fallback to data_exchange/image-svg.
 * Always renders an <img> — missing or broken URLs show the placeholder.
 */
const ListEntityImage = ({
    src,
    alt = '',
    className = '',
    variant = 'brand',
}) => {
    const handleImageError = (event) => {
        const img = event.currentTarget;
        if (img.dataset.resgridFallback === 'true' || isPlaceholderImageSrc(img.src)) return;
        img.dataset.resgridFallback = 'true';
        img.onerror = null;
        img.src = BRAND_SHOP_IMAGE_PLACEHOLDER;
    };
    const isBrand = variant === 'brand';
    const imgClass = isBrand ? 'brand-logo-img' : 'shop-logo-img';

    return (
        <span className={isBrand ? 'brand-avatar resgrid-entity-image' : 'shop-logo-wrapper resgrid-entity-image'}>
            <img
                src={resolveImageSrc(src)}
                alt={alt || (isBrand ? 'Brand logo' : 'Shop logo')}
                className={`${imgClass} ${className}`.trim()}
                onError={handleImageError}
            />
        </span>
    );
};

ListEntityImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['brand', 'shop']),
};

export default ListEntityImage;
