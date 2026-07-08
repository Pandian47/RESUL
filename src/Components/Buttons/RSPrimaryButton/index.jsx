import { memo } from 'react';
import PropTypes from 'prop-types';
import RSButton from '../RSButton';
import useBodyPointerLock from 'Hooks/useBodyPointerLock';

const RSPrimaryButton = ({
    bgc,
    disabledClass = '',
    className = '',
    paddingright,
    color,
    children,
    type = 'button',
    isLoading = false,
    loading = false,
    loadingText,
    blockBodyPointerEvents = false,
    blockInteraction = false,
    disabled,
    ...props
}) => {
    const showLoading = isLoading || loading;
    const isBlocked = showLoading || blockInteraction;

    useBodyPointerLock(showLoading && blockBodyPointerEvents);

    return (
        <RSButton
            disabledClass={`${disabledClass} ${isBlocked ? 'pe-none click-off' : ''}`}
            className={`${className} rs-button-primary`}
            style={{
                backgroundColor: bgc,
                paddingRight: paddingright,
                color: color,
            }}
            type={type}
            {...props}
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

RSPrimaryButton.propTypes = {
    bgc: PropTypes.string,
    paddingright: PropTypes.string,
    color: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.oneOf(['submit', 'button', 'reset']),
    isLoading: PropTypes.bool,
    loading: PropTypes.bool,
    loadingText: PropTypes.node,
    blockBodyPointerEvents: PropTypes.bool,
    blockInteraction: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default memo(RSPrimaryButton);
