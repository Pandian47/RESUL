import PropTypes from 'prop-types';
const SmartLinkInsertingOverlay = ({
    isLoading = false,
    message = 'Inserting smart link...',
    className = '',
    wrapperClassName = '',
    wrap = false,
    style,
    children,
}) => {
    const overlay = isLoading ? (
        <div
            className={`d-flex align-items-center justify-content-center position-absolute top0 start0 w-100 h-100 zIndex2 ${className}`}
            style={{ background: 'rgba(255, 255, 255, 0.6)', ...style }}
        >
            <div className="segment_loader" />
            <span className="ml10 fs14 color-primary-blue">{message}</span>
        </div>
    ) : null;

    if (!wrap && !children) {
        return overlay;
    }

    return (
        <div className={`position-relative ${isLoading ? 'click-off' : ''} ${wrapperClassName}`}>
            {overlay}
            {children}
        </div>
    );
};

SmartLinkInsertingOverlay.propTypes = {
    isLoading: PropTypes.bool,
    message: PropTypes.string,
    className: PropTypes.string,
    wrapperClassName: PropTypes.string,
    wrap: PropTypes.bool,
    style: PropTypes.object,
    children: PropTypes.node,
};

export default SmartLinkInsertingOverlay;
