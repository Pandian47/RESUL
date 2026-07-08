import { memo } from 'react';
import PropTypes from 'prop-types';
import RSButton from '../RSButton';
import useBodyPointerLock from 'Hooks/useBodyPointerLock';

const RSSecondaryButton = ({
    bgc,
    disabledClass = '',
    disabled,
    className = '',
    color,
    paddingright,
    type = 'button',
    children,
    isLoading = false,
    loading = false,
    loadingText,
    blockBodyPointerEvents = false,
    blockInteraction = false,
    ...props
}) => {
    const showLoading = isLoading || loading;
    const isBlocked = showLoading || blockInteraction;

    useBodyPointerLock(showLoading && blockBodyPointerEvents);

    return (
        <RSButton
            {...props}
            disabledClass={`${disabledClass} ${isBlocked ? 'pe-none click-off' : ''}`}
            className={` ${className} rs-button-link`}
            style={{
                backgroundColor: bgc,
                paddingRight: paddingright,
                color: color,
            }}
            type={type}
            disabled={isBlocked || disabled}
        >
            <div className="d-flex justify-content-center align-items-center gap-2">
                <div
                    className={`segment_loader rs-button-loading-icon ${showLoading ? 'is-active' : ''}`}
                    aria-hidden="true"
                />
                <div style={{ display: 'inline-block' }}>
                    {showLoading && loadingText ? loadingText : children}
                </div>
            </div>
        </RSButton>
    );
};

RSSecondaryButton.propTypes = {
    disabled: PropTypes.bool,
    className: PropTypes.string,
    bgc: PropTypes.string,
    paddingright: PropTypes.string,
    color: PropTypes.string,
    type: PropTypes.oneOf(['submit', 'button', 'reset']),
    isLoading: PropTypes.bool,
    loading: PropTypes.bool,
    loadingText: PropTypes.node,
    blockBodyPointerEvents: PropTypes.bool,
    blockInteraction: PropTypes.bool,
};

export default memo(RSSecondaryButton);
